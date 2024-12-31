import { INodeProperties } from "n8n-workflow";

export const devicedefinitions = {
	getProperties(): INodeProperties[] {
		return [
			{
				displayName: 'Developer JWT',
				name: 'developerJwt',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['devicedefinitions'],
					},
				},
				// TODO: Confirm format: either developer_jwt or jwt
				default: '={{ $json.developer_jwt }}',
				description: 'The Developer JWT. If you do not already have one, connect a DIMO Node before this to get one.',
				required: true,
			},
			{
				displayName: 'Country Code',
				name: 'countryCode',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['devicedefinitions'],
						// option: ['decodeVin'],
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
						// option: ['decodeVin'],
					},
				},
				default: '',
				description: 'The Vehicle Identifier Number',
				required: true,
			},
			// {
			// 	displayName: 'Query',
			// 	name: 'query',
			// 	type: 'string',
			// 	displayOptions: {
			// 		show: {
			// 			resource: ['devicedefinitions'],
			// 			option: ['search'],
			// 		},
			// 	},
			// 	default: '',
			// 	description: 'Your search query filter, e.g. Lexus gx 2023',
			// },
			// {
			// 	displayName: 'Vehicle Make',
			// 	name: 'makeSlug',
			// 	type: 'string',
			// 	displayOptions: {
			// 		show: {
			// 			resource: ['devicedefinitions'],
			// 			option: ['search'],
			// 		},
			// 	},
			// 	default: '',
			// 	description: 'The make of the vehicle you are searching, e.g. Audi, Lexus, etc'
			// },
			// {
			// 	displayName: 'Vehicle Model',
			// 	name: 'modelSlug',
			// 	type: 'string',
			// 	displayOptions: {
			// 		show: {
			// 			resource: ['devicedefinitions'],
			// 			option: ['search'],
			// 		},
			// 	},
			// 	default: '',
			// 	description: 'The model of the vehicle you are searching, e.g. Tacoma, Accord, etc'
			// },
			// {
			// 	displayName: 'Vehicle Year',
			// 	name: 'year',
			// 	type: 'number',
			// 	displayOptions: {
			// 		show: {
			// 			resource: ['devicedefinitions'],
			// 			option: ['search'],
			// 		},
			// 	},
			// 	default: '',
			// 	description: 'The year of the vehicle you are searching, e.g. 2024'
			// },
			// {
			// 	displayName: 'Page',
			// 	name: 'page',
			// 	type: 'number',
			// 	displayOptions: {
			// 		show: {
			// 			resource: ['devicedefinitions'],
			// 			option: ['search'],
			// 		},
			// 	},
			// 	default: '',
			// 	description: 'Page number (for pagniation, defaults to the first page)'
			// },
			// {
			// 	displayName: 'Page Size',
			// 	name: 'pageSize',
			// 	type: 'number',
			// 	displayOptions: {
			// 		show: {
			// 			resource: ['devicedefinitions'],
			// 			option: ['search'],
			// 		},
			// 	},
			// 	default: '',
			// 	description: 'Page size, (to specify the number of items to show on one page)'
			// },
		];
	},

	async execute(helper: any, operation: string) {
		const developerJwt = helper.executeFunctions.getNodeParameter('developerJwt', 0) as string;
		const countryCode = helper.executeFunctions.getNodeParameter('countryCode', 0) as string;
		const vin = helper.executeFunctions.getNodeParameter('vin', 0) as string;
		// const query = helper.executeFunctions.getNodeParameter('query', 0) as string;
		// const makeSlug = helper.executeFunctions.getNodeParameter('makeSlug', 0) as string;
		// const modelSlug = helper.executeFunctions.getNodeParameter('modelSlug', 0) as string;
		// const year = helper.executeFunctions.getNodeParameter('year', 0) as number;
		// const page = helper.executeFunctions.getNodeParameter('page', 0) as number;
		// const pageSize = helper.executeFunctions.getNodeParameter('pageSize', 0) as number;

		const basePath = helper.credentials.environment === 'Dev'
			? 'https://device-definitions-api.dev.dimo.zone'
			: 'https://device-definitions-api.dimo.zone';

		switch (operation) {
			case 'decodeVin':
			const decodeVinResponse = await helper.executeFunctions.helpers.request({
				method: 'POST',
				url: `${basePath}/device-definitions/decode-vin`,
				headers: {
					'Authorization': `Bearer ${developerJwt}`,
					'Content-Type': 'application/json',
				},
				// CHECK: NEEDED??
				body: JSON.stringify({
					countryCode,
					vin,
				})
			});

			return{
				decodeVinResponse
			}

			default:
				throw new Error(`The operation failed: ${operation}`)
		}
	}
}
