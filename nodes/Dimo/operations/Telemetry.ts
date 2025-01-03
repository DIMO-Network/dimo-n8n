import { INodeProperties } from "n8n-workflow";

export const telemetry = {
	getProperties(): INodeProperties[] {
		return [
			{
				displayName: 'Vehicle JWT',
				name: 'vehicleJwt',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['telemetry'],
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
						resource: ['telemetry'],
						operation: ['getVehicleVin']
					},
				},
				default: 0,
				description: 'The Token ID of the vehicle you are creating a VIN Verifiable Credential for',
				required: true,
			},
			{
				displayName: `Custom Telemetry Query`,
				name: 'customTelemetryQuery',
				type: 'string',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				displayOptions: {
					show: {
						resource: ['telemetry'],
						operation: ['customTelemetry']
					},
				},
				default: '',
				description: 'Your custom GraphQL query for Telemetry',
				required: true,
			},
			{
				displayName: `Variables`,
				name: 'variables',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['telemetry'],
						operation: ['customTelemetry']
					},
				},
				default: '{}',
				description: 'Variables for your custom Telemetry query',
			},
		];
	},

	async execute(helper: any, operation: string){
		const vehicleJwt = helper.executeFunctions.getNodeParameter('vehicleJwt', 0) as string;

		const basePath = helper.credentials.environment === 'Dev'
		? 'https://telemetry-api.dev.dimo.zone/query'
		: 'https://telemetry-api.dimo.zone/query';

		switch (operation) {
			case 'customTelemetry': {
				const customQuery = helper.executeFunctions.getNodeParameter('customTelemetryQuery', 0) as string;
				const variablesStr = helper.executeFunctions.getNodeParameter('variables', 0) as string;
				const variables = variablesStr ? JSON.parse(variablesStr) : {};

				const customResponse = await helper.executeFunctions.helpers.request({
					method: 'POST',
					url: basePath,
					headers: {
						'Authorization': `Bearer ${vehicleJwt}`,
						'Content-Type': 'application/json',
						'User-Agent': 'dimo-n8n-node',
					},
					body: JSON.stringify({
						query: customQuery,
						variables,
					}),
				});

				return JSON.parse(customResponse)
			}

			case 'getVehicleVin': {
				const tokenId = helper.executeFunctions.getNodeParameter('tokenId', 0) as number;

				const query = `{
				vinVCLatest(tokenId: ${tokenId}){
					vin
					}
				}`

				const vinResponse = await helper.executeFunctions.helpers.request({
					method: 'POST',
					url: basePath,
					headers: {
						'Authorization': `Bearer ${vehicleJwt}`,
						'Content-Type': 'application/json',
						'User-Agent': 'dimo-n8n-node',
					},
					body: JSON.stringify({
						query,
					}),
				});

				return JSON.parse(vinResponse)
			}

			default:
				throw new Error(`The operation failed: ${operation}`)
		}
	}
}
