import { INodeProperties } from "n8n-workflow";

export const authentication = {
	getProperties(): INodeProperties[] {
		return [
			{
				displayName: 'Token ID',
				name: 'tokenId',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['authentication'],
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
						resource: ['authentication'],
						operation: ['getVehicleJwt'],
					},
				},
				default: '',
				description: 'Comma-separated list of privileges - e.g. 1,2,3,4,5',
				required: true,
			},
		];
	},

	async execute(helper: any, operation: string) {
		try {
			const developerJwt = await helper.getDeveloperJwt();
			const tokenId = helper.executeFunctions.getNodeParameter('tokenId', 0) as number;
			const privilegesString = helper.executeFunctions.getNodeParameter('privileges', 0) as string;

			const vehicleJwt = await helper.getVehicleJwt(developerJwt, tokenId, privilegesString);

			return {"vehicleJwt": vehicleJwt}
		} catch {
				throw new Error(`The operation failed: ${operation}`)
		}
	}
}
