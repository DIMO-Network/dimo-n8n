import { INodeProperties } from "n8n-workflow";

export const trips = {
	getProperties(): INodeProperties[] {
		return [
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
			{
				displayName: 'Privileges',
				name: 'privileges',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['trips'],
					},
				},
				default: '',
				description: 'Comma-separated list of privileges - e.g. 1,2,3,4,5',
				required: true,
			},
		];
	},

	async execute(helper: any, operation: string) {
		const developerJwt = await helper.getDeveloperJwt();
		const tokenId = helper.executeFunctions.getNodeParameter('tokenId', 0) as number;
		const privilegesString = helper.executeFunctions.getNodeParameter('privileges', 0) as string;

		const vehicleJwt = await helper.getVehicleJwt(developerJwt, tokenId, privilegesString)

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
