import {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  IHttpRequestOptions,
  INodeExecutionData,
	// ApplicationError,
	// NodeApiError,
} from 'n8n-workflow';
import { ethers } from 'ethers';

interface DimoApiCredentials {
  clientId: string;
  domain: string;
  privateKey: string;
  environment: string;
}

export class Dimo implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'DIMO',
    name: 'dimo',
    icon: 'file:Dimo.svg',
    group: ['transform'],
    version: 1,
    description: 'Interact with the DIMO API',
    defaults: {
      name: 'DIMO',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'dimoApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Get Developer JWT',
            value: 'getDeveloperJwt',
          },
          {
            name: 'Get Vehicle JWT',
            value: 'getVehicleJwt',
          }
        ],
        default: 'getDeveloperJwt',
      },
      {
        displayName: 'Token ID',
        name: 'tokenId',
        type: 'number',
        displayOptions: {
          show: {
            operation: ['getVehicleJwt'],
          },
        },
        default: 0,
        description: 'The token ID of the vehicle',
        required: true,
      },
      {
        displayName: 'Privileges',
        name: 'privileges',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['getVehicleJwt'],
          },
        },
        default: '',
        description: 'Comma-separated list of privileges',
        required: true,
      }
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const returnData: INodeExecutionData[] = [];

    try {
      const credentials = await this.getCredentials('dimoApi') as unknown as DimoApiCredentials;
      const operation = this.getNodeParameter('operation', 0) as string;
      const environment = credentials.environment;

      const basePath = environment === 'Dev'
        ? 'https://auth.dev.dimo.zone'
        : 'https://auth.dimo.zone';

			const clientId = credentials.clientId;
			const domain = credentials.domain;

      // Get Developer JWT
      if (operation === 'getDeveloperJwt') {

				if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
					throw new NodeOperationError(
						this.getNode(),
						'Domain must include protocol (e.g., http:// or https://)'
					);
				}

				const requestBody = new URLSearchParams({
					client_id: clientId,
					domain: domain,
					scope: 'openid email',
					response_type: 'code',
					address: clientId
				}).toString();

				try {
					const challengeResponse = await this.helpers.request({
						method: 'POST',
						url: `${basePath}/auth/web3/generate_challenge`,
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'Accept': 'application/json',
							'User-Agent': 'dimo-n8n'
						},
						body: requestBody,
					});

					const parsedResponse = typeof challengeResponse === 'string'
						? JSON.parse(challengeResponse)
						: challengeResponse;

					if (!parsedResponse?.challenge) {
						throw new NodeOperationError(this.getNode(), "No challenge received in response.");
					}

					let privateKey = credentials.privateKey;
					if (!privateKey.startsWith('0x')) {
						privateKey = '0x' + privateKey;
					}

					const wallet = new ethers.Wallet(privateKey);

					const signature = await wallet.signMessage(parsedResponse.challenge);

					const submitBody = `client_id=${credentials.clientId}&domain=${encodeURIComponent(domain)}&state=${parsedResponse.state}&signature=${signature}&grant_type=authorization_code`;

					const submitResponse = await this.helpers.request({
						method: 'POST',
						url: `${basePath}/auth/web3/submit_challenge`,
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							// TODO: FIX/REMOVE
							// 'Accept': 'application/json',
							'User-Agent': 'dimo-n8n'
						},
						body: submitBody,
					});

					const parsedSubmitResponse = typeof submitResponse === 'string'
					? JSON.parse(submitResponse)
					: submitResponse;

					returnData.push({
						json: {
							developer_jwt: parsedSubmitResponse.access_token
						}
					});

				} catch (error) {
					console.error('Error details:', {
						message: error.message,
						statusCode: error.response?.statusCode,
						body: typeof error.response?.body === 'string'
							? error.response.body.substring(0, 500)
							: 'No response body'
					});

					throw new NodeOperationError(
						this.getNode(),
						`Authentication failed: ${error.message}`
					);
				}
			}
      // Get Vehicle JWT
			// TODO (BARRETT): NEED TO FIX VEHICLEJWT WITH FIXES IN DEV JWT
      else if (operation === 'getVehicleJwt') {
        const tokenId = this.getNodeParameter('tokenId', 0) as number;
        const privilegesString = this.getNodeParameter('privileges', 0) as string;
        const privileges = privilegesString.split(',').map(p => p.trim());

        const formParams = new URLSearchParams({
          client_id: clientId,
          domain: domain,
          scope: 'openid email',
          response_type: 'code',
          address: clientId
        });

        const challengeResponse = await this.helpers.request({
          method: 'POST',
          url: `${basePath}/auth/web3/generate_challenge`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'dimo-n8n'
          },
          body: formParams.toString()
        });


        const wallet = new ethers.Wallet(credentials.privateKey);
        const signature = await wallet.signMessage(challengeResponse.challenge);


        const submitParams = new URLSearchParams({
          client_id: credentials.clientId.toLowerCase(),
          domain: domain,
          state: challengeResponse.state,
          signature,
          grant_type: 'authorization_code'
        });

        const devJwtResponse = await this.helpers.request({
          method: 'POST',
          url: `${basePath}/auth/web3/submit_challenge`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'dimo-n8n'
          },
          body: submitParams.toString()
        });

        const developerJwt = devJwtResponse.access_token;

        // Use Developer JWT to get Vehicle JWT
        const vehicleOptions: IHttpRequestOptions = {
          method: 'POST',
          url: 'https://token-exchange-api.dimo.zone/v1/tokens/exchange',
          headers: {
            'Authorization': `Bearer ${developerJwt}`,
            'Content-Type': 'application/json',
          },
          body: {
            nftContractAddress: credentials.environment === 'Dev'
              ? '0x45fbCD3ef7361d156e8b16F5538AE36DEdf61Da8'
              : '0xbA5738a18d83D41847dfFbDC6101d37C69c9B0cF',
            privileges,
            tokenId,
          },
          json: true,
        };

        const vehicleResponse = await this.helpers.request(vehicleOptions);

        returnData.push({
          json: {
            vehicle_jwt: vehicleResponse.vehicle_jwt,
            developer_jwt: developerJwt,
            token_id: tokenId,
            privileges: privileges
          }
        });
      }

      return [returnData];

    } catch (error) {
      console.error('Full error details:', {
				// TODO (BARRETT): REMOVE BEFORE PUBLISH - DEBUGGING
        name: error.name,
        message: error.message,
        response: error.response?.body || error.response?.data,
        stack: error.stack
      });

      if (error instanceof NodeOperationError) {
        throw error;
      }

      throw new NodeOperationError(
        this.getNode(),
        `DIMO API error: ${error.message}`,
        {
          description: error.response?.body || error.response?.data
            ? JSON.stringify(error.response.body || error.response.data)
            : undefined
        }
      );
    }
  }
}
