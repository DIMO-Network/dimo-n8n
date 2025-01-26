import { INodeProperties } from 'n8n-workflow';
import { attestationProperties } from '../descriptions/AttestationDescription';

export const attestation = {
	getProperties(): INodeProperties[] {
		return attestationProperties;
	},

	async execute(helper: any, operation: string) {
		const developerJwt = await helper.getDeveloperJwt();
		const tokenId = helper.executeFunctions.getNodeParameter('tokenId', 0) as number;
		const privilegesString = await helper.permissionsDecoder(tokenId);

		const vehicleJwt = await helper.getVehicleJwt(developerJwt, tokenId, privilegesString);

		const basePath =
			helper.credentials.environment === 'Dev'
				? 'https://attestation-api.dev.dimo.zone'
				: 'https://attestation-api.dimo.zone';

		switch (operation) {
			case 'createVinVc':
				const vinVcResponse = await helper.executeFunctions.helpers.request({
					method: 'POST',
					url: `${basePath}/v1/vc/vin/${tokenId}`,
					headers: {
						Authorization: `Bearer ${vehicleJwt}`,
						'Content-Type': 'application/json',
					},
					params: { force: true },
				});

				return {
					message: vinVcResponse.message,
					vinVcResponse,
				};

			case `createPomVc`:
				const pomVcResponse = await helper.executeFunctions.helpers.request({
					method: 'POST',
					url: `${basePath}/v1/vc/pom/${tokenId}`,
					headers: {
						Authorization: `Bearer ${vehicleJwt}`,
						'Content-Type': 'application/json',
					},
				});

				return {
					message: pomVcResponse.message,
					pomVcResponse,
				};

			default:
				// TODO: Better errors
				throw new Error(`The operation failed: ${operation}`);
		}
	},
};
