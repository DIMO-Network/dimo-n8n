import { INodeProperties } from 'n8n-workflow';
import { identityProperties } from '../descriptions/IdentityDescription';

export const identity = {
	getProperties(): INodeProperties[] {
		return identityProperties;
	},

	async execute(helper: any, operation: string) {
		const basePath =
			helper.credentials.environment === 'Dev'
				? 'https://identity-api.dev.dimo.zone/query'
				: 'https://identity-api.dimo.zone/query';

		switch (operation) {
			case 'customIdentity': {
				const customQuery = helper.executeFunctions.getNodeParameter(
					'customIdentityQuery',
					0,
				) as string;
				const variablesStr = helper.executeFunctions.getNodeParameter('variables', 0) as string;
				const variables = variablesStr ? JSON.parse(variablesStr) : {};

				const customResponse = await helper.executeFunctions.helpers.request({
					method: 'POST',
					url: basePath,
					headers: {
						'Content-Type': 'application/json',
						'User-Agent': 'dimo-n8n-node',
					},
					body: JSON.stringify({
						query: customQuery,
						variables,
					}),
				});

				return JSON.parse(customResponse);
			}

			case 'countDimoVehicles': {
				const query = `{
                    vehicles(first: 10) {
                        totalCount
                    }
                }`;

				const countResponse = await helper.executeFunctions.helpers.request({
					method: 'POST',
					url: basePath,
					headers: {
						'Content-Type': 'application/json',
						'User-Agent': 'dimo-n8n-node',
					},
					body: JSON.stringify({
						query,
						variables: {},
					}),
				});

				return JSON.parse(countResponse);
			}

			default:
				throw new Error(`The operation failed: ${operation}`);
		}
	},
};
