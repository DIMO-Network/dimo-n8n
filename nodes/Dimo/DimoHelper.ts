import { IExecuteFunctions, NodeOperationError, } from "n8n-workflow";
import { ethers } from 'ethers';

export class DimoHelper {
  private credentials: any;
  private executeFunctions: IExecuteFunctions;

  constructor(executeFunctions: IExecuteFunctions, credentials: any) {
    this.executeFunctions = executeFunctions;
    this.credentials = credentials;
  }

	get basePath(): string {
		return this.credentials.environment === 'Dev'
		? 'https://auth.dev.dimo.zone'
		: 'https://auth.dimo.zone';
	}

	get nftAddress(): string {
		return this.credentials.environment === 'Dev'
		? '0x45fbCD3ef7361d156e8b16F5538AE36DEdf61Da8'
		: '0xbA5738a18d83D41847dfFbDC6101d37C69c9B0cF';
	}

	checkDomain(): void {
		if (!this.credentials.domain.startsWith('http://') && !this.credentials.domain.startsWith('https://')) {
			throw new NodeOperationError(
			this.executeFunctions.getNode(),
			'Domain must include the protocol - e.g. http:// or https://'
			);
		}
	}

	async generateChallenge(): Promise<{ challenge: string, state: string }> {
		const requestBody = new URLSearchParams({
			client_id: this.credentials.clientId,
			domain: this.credentials.domain,
			scope: 'openid email',
			response_type: 'code',
			address: this.credentials.clientId,
		}).toString();

		const challengeResponse = await this.executeFunctions.helpers.request({
			method: 'POST',
			url: `${this.basePath}/auth/web3/generate_challenge`,
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
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				'Challenge was not found in the response'
			);
		}

		return parsedResponse;
	}

	async signChallenge(challenge: string): Promise<string> {
		let apiKey = this.credentials.apiKey;
		if (!apiKey.startsWith('0x')) {
			apiKey = '0x' + apiKey;
		}

		const wallet = new ethers.Wallet(apiKey);
		return await wallet.signMessage(challenge);
	}

	async submitChallenge(state: string, signature: string): Promise<any> {
		const submitBody = `client_id=${this.credentials.clientId}&domain=${encodeURIComponent(this.credentials.domain)}&state=${state}&signature=${signature}&grant_type=authorization_code`;

		const submitResponse = await this.executeFunctions.helpers.request({
			method: 'POST',
			url: `${this.basePath}/auth/web3/submit_challenge`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'dimo-n8n'
			},
			body: submitBody,
		});

		return typeof submitResponse === 'string'
			? JSON.parse(submitResponse)
			: submitResponse;
	}

	async getDeveloperJwt(): Promise<string> {
		this.checkDomain();
		const { challenge, state } = await this.generateChallenge();
		const signature = await this.signChallenge(challenge);
		const response = await this.submitChallenge(state, signature);

		return response.access_token;
	}

	// async permissionsDecoder(tokenId: number): Promise<any> {
	// 	const developerLicense = this.credentials.clientId;

	// 	const identityQuery = `{
	// 			vehicle(tokenId: ${tokenId}) {
	// 				sacds(first:100) {
	// 					nodes {
	// 						permissions
	// 						grantee
	// 					}
	// 				}
	// 			}
	// 		}`;

	// 		const queryResponse = await this.executeFunctions.helpers.request({
	// 			method: 'POST',
	// 			url: 'https://identity-api.dimo.zone/query',
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 				'User-Agent': 'dimo-n8n'
	// 			},
	// 			body: JSON.stringify({
	// 				query: identityQuery,
	// 				variables: {},
	// 			}),
	// 		});

	// 		const filteredSacd = queryResponse?.data?.vehicle?.sacds?.nodes?.filter(
	// 			(node: any) => node.grantee.toLowerCase() === developerLicense.toLowerCase())
	// 		if (filteredSacd.permissions == "0x3ffc") {
	// 			return "1,2,3,4,5,6"
	// 		} else if (filteredSacd.permissions == "0xffc") {
	// 			return "1,2,3,4,5"
	// 		} else if (filteredSacd.permissions == "0x3fcc") {
	// 			return "1,3,4,5,6"
	// 		}
	// }

	async getVehicleJwt(devJwt: string, tokenId: number, privilegesString: string): Promise<any> {
		const privileges = privilegesString.split(',').map(p => parseInt(p.trim(), 10));

		const vehicleJwtResponse = await this.executeFunctions.helpers.request({
			method: 'POST',
			url: 'https://token-exchange-api.dimo.zone/v1/tokens/exchange',
			headers: {
				'Authorization': `Bearer ${devJwt}`,
				'Content-Type': 'application/json',
				'User-Agent': 'dimo-n8n'
			},
			body: JSON.stringify({
				nftContractAddress: this.nftAddress,
				privileges,
				tokenId
			}),
		});

		const parsedVehicleJwtResponse = typeof vehicleJwtResponse === 'string'
					? JSON.parse(vehicleJwtResponse)
					: vehicleJwtResponse;

		return parsedVehicleJwtResponse.token
	}
}
