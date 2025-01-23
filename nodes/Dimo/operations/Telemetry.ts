import { INodeProperties } from "n8n-workflow";
import { telemetryProperties } from "../descriptions/TelemetryDescription";

export const telemetry = {
	getProperties(): INodeProperties[] {
		return telemetryProperties;
	},

	async execute(helper: any, operation: string){
		const developerJwt = await helper.getDeveloperJwt();
		const tokenId = helper.executeFunctions.getNodeParameter('tokenId', 0) as number;
		const privilegesString = await helper.permissionsDecoder(tokenId);

		const vehicleJwt = await helper.getVehicleJwt(developerJwt, tokenId, privilegesString)

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
