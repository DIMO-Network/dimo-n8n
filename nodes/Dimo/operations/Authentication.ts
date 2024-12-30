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
		switch (operation) {
			case 'getDeveloperJwt':
				const jwt = await helper.getDeveloperJwt();
				return { developer_jwt: jwt }
			case 'getVehicleJwt':
				const devJwt = await helper.getDeveloperJwt();
				const tokenId = helper.executeFunctions.getNodeParameter('tokenId', 0) as number;
        const privilegesString = helper.executeFunctions.getNodeParameter('privileges', 0) as string;
        const privileges = privilegesString.split(',').map(p => parseInt(p.trim(), 10));

				const vehicleJwtResponse = await helper.executeFunctions.helpers.request({
					method: 'POST',
					url: 'https://token-exchange-api.dimo.zone/v1/tokens/exchange',
          headers: {
            'Authorization': `Bearer ${devJwt}`,
            'Content-Type': 'application/json',
            'User-Agent': 'dimo-n8n'
          },
          body: JSON.stringify({
            nftContractAddress: helper.nftAddress,
            privileges,
            tokenId
          }),
				});

				const parsedVehicleJwtResponse = typeof vehicleJwtResponse === 'string'
					? JSON.parse(vehicleJwtResponse)
					: vehicleJwtResponse;

				return { vehicle_jwt: parsedVehicleJwtResponse.token }

			default:
				// TODO (Barrett): better error messaging here
				throw new Error(`This operation failed: ${operation}`)
		}
	}
}
