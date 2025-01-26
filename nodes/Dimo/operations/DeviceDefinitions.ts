import { INodeProperties } from 'n8n-workflow';
import { deviceDefinitionsProperties } from '../descriptions/DeviceDefinitionsDescription';

export const devicedefinitions = {
	getProperties(): INodeProperties[] {
		return deviceDefinitionsProperties;
	},

	async execute(helper: any, operation: string) {
		const developerJwt = await helper.getDeveloperJwt();

		const basePath =
			helper.credentials.environment === 'Dev'
				? 'https://device-definitions-api.dev.dimo.zone'
				: 'https://device-definitions-api.dimo.zone';

		switch (operation) {
			case 'decodeVin':
				const countryCode = helper.executeFunctions.getNodeParameter('countryCode', 0) as string;
				const vin = helper.executeFunctions.getNodeParameter('vin', 0) as string;

				const decodeVinResponse = await helper.executeFunctions.helpers.request({
					method: 'POST',
					url: `${basePath}/device-definitions/decode-vin`,
					headers: {
						Authorization: `Bearer ${developerJwt}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						countryCode,
						vin,
					}),
				});
				return JSON.parse(decodeVinResponse);

			case 'search': {
				const searchParams: Record<string, string | number> = {};

				const paramList = ['query', 'makeSlug', 'modelSlug', 'year', 'page', 'pageSize'];
				for (const param of paramList) {
					const value = helper.executeFunctions.getNodeParameter(param, 0);
					if (value !== null && value !== '') {
						searchParams[param] = value;
					}
				}

				const searchResponse = await helper.executeFunctions.helpers.request({
					method: 'GET',
					url: `${basePath}/device-definitions/search`,
					headers: {
						Authorization: `Bearer ${developerJwt}`,
						'Content-Type': 'application/json',
					},
					params: searchParams,
				});
				return JSON.parse(searchResponse);
			}

			default:
				throw new Error(`The operation failed: ${operation}`);
		}
	},
};
