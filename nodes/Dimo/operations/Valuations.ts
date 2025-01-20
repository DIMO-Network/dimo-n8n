import { INodeProperties } from "n8n-workflow";
import { valuationsProperties } from "../descriptions/ValuationsDescription";

export const valuations = {
	getProperties(): INodeProperties[]{
		return valuationsProperties;
	},

	async execute(helper: any, operation: string) {
		const developerJwt = await helper.getDeveloperJwt();
		const tokenId = helper.executeFunctions.getNodeParameter('tokenId', 0) as number;
		const privilegesString = helper.executeFunctions.getNodeParameter('privileges', 0) as string;

		const vehicleJwt = await helper.getVehicleJwt(developerJwt, tokenId, privilegesString)

		const basePath = helper.credentials.environment === 'Dev'
			? 'https://valuations-api.dev.dimo.zone'
			: 'https://valuations-api.dimo.zone';

		switch(operation) {
			case 'valuationsLookup':
				const valuationsLookupResponse = await helper.executeFunctions.helpers.request({
					method: 'GET',
					url: `${basePath}/v2/vehicles/${tokenId}/valuations`,
					headers: {
						'Authorization': `Bearer ${vehicleJwt}`,
						'Content-Type': 'application/json',
					},
				});
				return JSON.parse(valuationsLookupResponse)

			case 'getInstantOffer':
				const valuationsInstantOfferResponse = await helper.executeFunctions.helpers.request({
					method: 'POST',
					url: `${basePath}/v2/vehicles/${tokenId}/instant-offer`,
					headers: {
						'Authorization': `Bearer ${vehicleJwt}`,
						'Content-Type': 'application/json',
					},
				});
				return JSON.parse(valuationsInstantOfferResponse)

			case 'listExistingOffers':
				const valuationsExistingOffersResponse = await helper.executeFunctions.helpers.request({
					method: 'GET',
					url: `${basePath}/v2/vehicles/${tokenId}/offers`,
					headers: {
						'Authorization': `Bearer ${vehicleJwt}`,
						'Content-Type': 'application/json',
					},
				});
				return JSON.parse(valuationsExistingOffersResponse)

			default:
				throw new Error(`The operations failed: ${operation}`)
		}
	}
}
