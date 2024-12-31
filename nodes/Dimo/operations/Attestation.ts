import { INodeProperties } from "n8n-workflow";

export const attestation = {
	getProperties(): INodeProperties[] {
		return [
			{
				displayName: 'Vehicle JWT',
				name: 'vehicleJwt',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['attestation'],
					},
				},
				default: '={{ $json.vehicle_jwt }}',
				description: 'The JWT token for the vehicle. If you do not already have one, connect a DIMO Node before this to get one.',
				required: true,
			},
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
		];
	},

	async execute(helper: any, operation: string){
		const vehicleJwt = helper.executeFunctions.getNodeParameter('vehicleJwt', 0) as string;
		const tokenId = helper.executeFunctions.getNodeParameter('tokenId', 0) as number;

		switch (operation) {
			case 'createVinVc':
			// TODO: Create Base paths in DimoHelper.ts for all endpoints - dev/prod
			const vinVcResponse = await helper.executeFunctions.helpers.request({
				method: 'POST',
				url: `https://attestation-api.dimo.zone/v1/vc/vin/${tokenId}`,
				headers: {
					'Authorization': `Bearer ${vehicleJwt}`,
          'Content-Type': 'application/json',
				},
				params: { force: true },
			});

			return vinVcResponse;
			case `createPomVc`:
				const pomVcResponse = await helper.executeFunctions.helpers.request({
					method: 'POST',
					url: `https://attestation-api.dimo.zone/v1/vc/pom/${tokenId}`,
					headers: {
						'Authorization': `Bearer ${vehicleJwt}`,
          	'Content-Type': 'application/json',
					},
				});

				return pomVcResponse;

			default:
				// TODO: Better errors
				throw new Error(`The operation failed: ${operation}`)
		}
	}
}
