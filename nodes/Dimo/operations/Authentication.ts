import { INodeProperties } from "n8n-workflow";
import { authenticationProperties } from "../descriptions/AuthDescription";

export const authentication = {
	getProperties(): INodeProperties[] {
		return authenticationProperties;
	},

	async execute(helper: any, operation: string) {
		try {
			const developerJwt = await helper.getDeveloperJwt();
			const tokenId = helper.executeFunctions.getNodeParameter('tokenId', 0) as number;
			const privilegesString = helper.executeFunctions.getNodeParameter('privileges', 0) as string;

			const vehicleJwt = await helper.getVehicleJwt(developerJwt, tokenId, privilegesString);

			return {"vehicleJwt": vehicleJwt}
		} catch {
				throw new Error(`The operation failed: ${operation}`)
		}
	}
}
