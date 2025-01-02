import { INodeProperties } from "n8n-workflow";

export const trips = {
	getProperties(): INodeProperties[] {
		return [
			{
				displayName: 'Vehicle JWT',
				name: 'vehicleJwt',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['trips'],
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
						resource: ['trips'],
					},
				},
				default: 0,
				description: 'The Token ID of the vehicle you are getting trip data for',
				required: true,
			},
		];
	},

	async execute(helper: any, operation: string) {
		const vehicleJwt = helper.executeFunctions.getNodeParameter('vehicleJwt', 0) as string;
		const tokenId = helper.executeFunctions.getNodeParameter('tokenId', 0) as number;

		const basePath = helper.credentials.environment === 'Dev'
			? 'https://trips-api.dev.dimo.zone'
			: 'https://trips-api.dimo.zone'

		try {
			const tripsResponse = await helper.executeFunctions.helpers.request({
				method: 'GET',
				url: `${basePath}/v1/vehicle/${tokenId}/trips`,
				headers: {
					'Authorization': `Bearer ${vehicleJwt}`,
					'Content-Type': 'application/json',
				},
			});

			return JSON.parse(tripsResponse)

		} catch {
			throw new Error(`The operation failed: ${operation}`)
		}
	}
}
