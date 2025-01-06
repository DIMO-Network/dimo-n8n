import { INodeProperties } from "n8n-workflow";

export const devicedefinitions = {
	getProperties(): INodeProperties[] {
		return [
			{
				displayName: 'Country Code',
				name: 'countryCode',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['devicedefinitions'],
						operation: ['decodeVin'],
					},
				},
				default: '',
				description: '3-letter ISO 3166-1 alpha-3 country code, e.g. USA',
				required: true,
			},
			{
				displayName: 'VIN',
				name: 'vin',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['devicedefinitions'],
						operation: ['decodeVin'],
					},
				},
				default: '',
				description: 'The Vehicle Identifier Number',
				required: true,
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['devicedefinitions'],
						operation: ['search'],
					},
				},
				default: '',
				description: 'Your search query filter, e.g. Lexus gx 2023',
			},
			{
				displayName: 'Vehicle Make',
				name: 'makeSlug',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['devicedefinitions'],
						operation: ['search'],
					},
				},
				default: '',
				description: 'The make of the vehicle you are searching, e.g. Audi, Lexus, etc'
			},
			{
				displayName: 'Vehicle Model',
				name: 'modelSlug',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['devicedefinitions'],
						operation: ['search'],
					},
				},
				default: '',
				description: 'The model of the vehicle you are searching, e.g. Tacoma, Accord, etc'
			},
			{
				displayName: 'Vehicle Year',
				name: 'year',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['devicedefinitions'],
						operation: ['search'],
					},
				},
				default: '',
				description: 'The year of the vehicle you are searching, e.g. 2024'
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['devicedefinitions'],
						operation: ['search'],
					},
				},
				default: '',
				description: 'Page number (for pagniation, defaults to the first page)'
			},
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['devicedefinitions'],
						operation: ['search'],
					},
				},
				default: '',
				description: 'Page size, (to specify the number of items to show on one page)'
			},
		];
	},

	async execute(helper: any, operation: string) {
		const developerJwt = await helper.getDeveloperJwt();

		const basePath = helper.credentials.environment === 'Dev'
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
					'Authorization': `Bearer ${developerJwt}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					countryCode,
					vin,
				})
			});
			return JSON.parse(decodeVinResponse)

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
							'Authorization': `Bearer ${developerJwt}`,
							'Content-Type': 'application/json',
						},
						params: searchParams,
				});
				return JSON.parse(searchResponse);
		}

			default:
				throw new Error(`The operation failed: ${operation}`)
		}
	}
}
