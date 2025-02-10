import { INodeProperties } from 'n8n-workflow';
import { valuationsProperties } from '../descriptions/ValuationsDescription';

const valuationsReqs = new Map([
	['valuationsLookup', async(helper: any, tokenId: number, vehicleJwt: string, basePath: string) => {
		const response = await helper.executeFunctions.helpers.request({
			method: 'GET',
			url: `${basePath}/v2/vehicles/${tokenId}/valuations`,
			headers: {
				Authorization: `Bearer ${vehicleJwt}`,
				'Content-Type': 'application/json',
			},
		});
		return JSON.parse(response);
	}],
	['getInstantOffer', async(helper: any, tokenId: number, vehicleJwt: string, basePath: string) => {
		const response = await helper.executeFunctions.helpers.request({
			method: 'POST',
			url: `${basePath}/v2/vehicles/${tokenId}/instant-offer`,
			headers: {
				Authorization: `Bearer ${vehicleJwt}`,
				'Content-Type': 'application/json',
			},
		});
		return JSON.parse(response);
	}],
	['listExistingOffers', async(helper: any, tokenId: number, vehicleJwt: string, basePath: string) => {
		const response = await helper.executeFunctions.helpers.request({
			method: 'GET',
			url: `${basePath}/v2/vehicles/${tokenId}/offers`,
			headers: {
				Authorization: `Bearer ${vehicleJwt}`,
				'Content-Type': 'application/json',
			},
		});
		return JSON.parse(response);
	}],
]);

export const valuations = {
	getProperties(): INodeProperties[] {
		return valuationsProperties;
	},

	async execute(helper: any, operation: string) {
		const developerJwt = await helper.getDeveloperJwt();
		const tokenId = helper.executeFunctions.getNodeParameter('tokenId', 0) as number;
		const privilegesString = await helper.permissionsDecoder(tokenId);

		const vehicleJwt = await helper.getVehicleJwt(developerJwt, tokenId, privilegesString);

		const basePath =
			helper.credentials.environment === 'Dev'
				? 'https://valuations-api.dev.dimo.zone'
				: 'https://valuations-api.dimo.zone';

		const executeOperation = valuationsReqs.get(operation);
		if (!executeOperation) {
			throw new Error(`The operation ${operation} is not supported.`);
		}

		return executeOperation(helper, tokenId, vehicleJwt, basePath);;
	},
};
