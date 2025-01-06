import { INodeProperties } from "n8n-workflow";

export const attestation = {
	getProperties(): INodeProperties[] {
		return [
			{
				displayName: 'Token ID',
				name: 'tokenId',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['attestation'],
					},
				},
				default: 0,
				description: 'The Token ID of the vehicle you are creating a VIN Verifiable Credential for',
				required: true,
			},
			{
				displayName: 'Privileges',
				name: 'privileges',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['attestation'],
					},
				},
				default: '',
				description: 'Comma-separated list of privileges - e.g. 1,2,3,4,5',
				required: true,
			},
		];
	},

	async execute(helper: any, operation: string){
		const developerJwt = await helper.getDeveloperJwt();
		const tokenId = helper.executeFunctions.getNodeParameter('tokenId', 0) as number;
		const privilegesString = helper.executeFunctions.getNodeParameter('privileges', 0) as string;

		const vehicleJwt = await helper.getVechileJwt(developerJwt, tokenId, privilegesString)

		const basePath = helper.credentials.environment === 'Dev'
    ? 'https://attestation-api.dev.dimo.zone'
    : 'https://attestation-api.dimo.zone';


		switch (operation) {
			case 'createVinVc':
			const vinVcResponse = await helper.executeFunctions.helpers.request({
				method: 'POST',
				url: `${basePath}/v1/vc/vin/${tokenId}`,
				headers: {
					'Authorization': `Bearer ${vehicleJwt}`,
          'Content-Type': 'application/json',
				},
				params: { force: true },
			});

			return {
				message: vinVcResponse.message,
				vinVcResponse
			}


			case `createPomVc`:
				const pomVcResponse = await helper.executeFunctions.helpers.request({
					method: 'POST',
					url: `${basePath}/v1/vc/pom/${tokenId}`,
					headers: {
						'Authorization': `Bearer ${vehicleJwt}`,
          	'Content-Type': 'application/json',
					},
				});

				return {
					message: pomVcResponse.message,
					pomVcResponse,
				}

			default:
				// TODO: Better errors
				throw new Error(`The operation failed: ${operation}`)
		}
	}
}
