import {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  INodeExecutionData,
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
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Authentication',
            value: 'authentication',
          },
          {
            name: 'Attestation API',
            value: 'attestation',
          },
					{
						name: 'Device Data API',
						value: 'devicedata',
					},
					{
						name: 'Identity API',
						value: 'identity',
					},
					// TODO: Add Telemetry + disable linting for alphabetical order (its incorrect)
        ],
        default: 'authentication',
      },
			// Authentication Options
			{
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
				noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['authentication'],
          },
        },
        options: [
          {
            name: 'Get Developer JWT',
            value: 'getDeveloperJwt',
						action: 'Get developer jwt',
          },
          {
            name: 'Get Vehicle JWT',
            value: 'getVehicleJwt',
						action: 'Get vehicle jwt'
          },
        ],
        default: 'getDeveloperJwt',
      },
			// Attestation Options
			{
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
				noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['attestation'],
          },
        },
        options: [
          {
            name: 'Create VIN VC',
            value: 'createVinVc',
						action: 'Create vin vc'
          },
          {
            name: 'Create POM VC',
            value: 'createPomVc',
						action: 'Create pom vc'
          },
        ],
        default: 'createVinVc',
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
      else if (operation === 'getVehicleJwt') {
        const tokenId = this.getNodeParameter('tokenId', 0) as number;
        const privilegesString = this.getNodeParameter('privileges', 0) as string;
				const privileges = privilegesString
					.split(',')
					.map(p => parseInt(p.trim(), 10));

				if (privileges.some(isNaN)) {
					throw new NodeOperationError(
						this.getNode(),
						'All privileges must be valid numbers'
					);
				}

				if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
					throw new NodeOperationError(
						this.getNode(),
						'Domain must include protocol (e.g., http:// or https://)'
					);
				}

				const devJwtRequestBody = new URLSearchParams({
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
						body: devJwtRequestBody,
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

					const devJwtResponse = await this.helpers.request({
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

					const parsedDevJwtResponse = typeof devJwtResponse === 'string'
					? JSON.parse(devJwtResponse)
					: devJwtResponse;

					const nftAddress = environment === 'Dev'
						? '0x45fbCD3ef7361d156e8b16F5538AE36DEdf61Da8'
      			: '0xbA5738a18d83D41847dfFbDC6101d37C69c9B0cF';

					//TODO: REMOVE CONSOLE LOG
					console.log('Vehicle JWT Request:', {
						url: 'https://token-exchange-api.dimo.zone/v1/tokens/exchange',
						tokenId: Number(tokenId),
						privilegesType: typeof privileges,
						privileges: privileges,
						nftAddress: nftAddress
					});
					//TODO: REMOVE CONSOLE LOG
					if (!Array.isArray(privileges) || privileges.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'Privileges must be a non-empty array'
						);
					}

					//TODO: REMOVE CONSOLE LOG
					if (!Number.isInteger(Number(tokenId)) || Number(tokenId) <= 0) {
						throw new NodeOperationError(
							this.getNode(),
							'Token ID must be a positive integer'
						);
					}

					const vehicleJwtResponse = await this.helpers.request({
						method: 'POST',
						url: 'https://token-exchange-api.dimo.zone/v1/tokens/exchange',
						headers: {
							'Authorization': `Bearer ${parsedDevJwtResponse.access_token}`,
							'Content-Type': 'application/json',
							'User-Agent': 'dimo-n8n'
						},
						body: {
							nftContractAddress: nftAddress,
							privileges,
							tokenId
						},
					});

					const parsedVehicleJwtResponse = typeof vehicleJwtResponse === 'string'
						? JSON.parse(vehicleJwtResponse)
						: vehicleJwtResponse;

											//TODO: REMOVE CONSOLE LOG

					console.log('Vehicle JWT Response:', {
						success_vehicle_jwt: Boolean(parsedVehicleJwtResponse?.token),
						responseType: typeof parsedVehicleJwtResponse
					});

					returnData.push({
						json: {
							//TODO (BARRETT): Return any other data here?
							// Include dev jwt or keep things streamlined?
							vehicle_jwt: parsedVehicleJwtResponse.token,
							// developer_jwt:parsedDevJwtResponse.access_token
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

	return [returnData]
} catch (error) {
	console.error('Operation failed: ', error);
	if (error.response) {
		throw new NodeOperationError(
			this.getNode(),
			`DIMO API error: ${error.response.data}`
		);
	}
	throw error;
}
}
}
