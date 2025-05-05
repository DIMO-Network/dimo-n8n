import { INodeProperties } from 'n8n-workflow';
import { vehicleEventsProperties } from '../descriptions/VehicleEventsDescription';
import { DimoHelper } from '../DimoHelper';

const vehicleEventsReqs = new Map([
  ['getAllWebhooks', async (helper: DimoHelper, developerJwt: string, basePath: string) => {
    const response = await helper.executeFunctions.helpers.request({
      method: 'GET',
      url: `${basePath}/v1/webhooks`,
      headers: {
        Authorization: `Bearer ${developerJwt}`,
        'Content-Type': 'application/json',
      },
    });
    return JSON.parse(response);
  }],

  ['registerWebhook', async (helper: DimoHelper, developerJwt: string, basePath: string) => {
    const service = helper.executeFunctions.getNodeParameter('service', 0) as string;
    const data = helper.executeFunctions.getNodeParameter('data', 0) as string;
    const trigger = helper.executeFunctions.getNodeParameter('trigger', 0) as string;
    const setup = helper.executeFunctions.getNodeParameter('setup', 0) as string;
    const description = helper.executeFunctions.getNodeParameter('description', 0) as string;
    const targetUri = helper.executeFunctions.getNodeParameter('targetUri', 0) as string;
    const status = helper.executeFunctions.getNodeParameter('status', 0) as string;

    const response = await helper.executeFunctions.helpers.request({
      method: 'POST',
      url: `${basePath}/v1/webhooks`,
      headers: {
        Authorization: `Bearer ${developerJwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service,
        data,
        trigger,
        setup,
        description,
        target_uri: targetUri,
        status,
      }),
    });
    return JSON.parse(response);
  }],

  ['deleteWebhook', async (helper: DimoHelper, developerJwt: string, basePath: string) => {
    const webhookId = helper.executeFunctions.getNodeParameter('webhookId', 0) as string;

    const response = await helper.executeFunctions.helpers.request({
      method: 'DELETE',
      url: `${basePath}/v1/webhooks/${webhookId}`,
      headers: {
        Authorization: `Bearer ${developerJwt}`,
        'Content-Type': 'application/json',
      },
    });
    return JSON.parse(response);
  }],

  ['updateWebhook', async (helper: DimoHelper, developerJwt: string, basePath: string) => {
    const webhookId = helper.executeFunctions.getNodeParameter('webhookId', 0) as string;
    const service = helper.executeFunctions.getNodeParameter('service', 0) as string;
    const data = helper.executeFunctions.getNodeParameter('data', 0) as string;
    const trigger = helper.executeFunctions.getNodeParameter('trigger', 0) as string;
    const setup = helper.executeFunctions.getNodeParameter('setup', 0) as string;
    const description = helper.executeFunctions.getNodeParameter('description', 0) as string;
    const targetUri = helper.executeFunctions.getNodeParameter('targetUri', 0) as string;
    const status = helper.executeFunctions.getNodeParameter('status', 0) as string;

    const response = await helper.executeFunctions.helpers.request({
      method: 'PUT',
      url: `${basePath}/v1/webhooks/${webhookId}`,
      headers: {
        Authorization: `Bearer ${developerJwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service,
        data,
        trigger,
        setup,
        description,
        target_uri: targetUri,
        status,
      }),
    });
    return JSON.parse(response);
  }],

  ['subscribeVehicleToWebhook', async (helper: DimoHelper, developerJwt: string, basePath: string) => {
    const webhookId = helper.executeFunctions.getNodeParameter('webhookId', 0) as string;
    const tokenId = helper.executeFunctions.getNodeParameter('tokenId', 0) as string;

    const response = await helper.executeFunctions.helpers.request({
      method: 'POST',
      url: `${basePath}/v1/webhooks/${webhookId}/subscribe/${tokenId}`,
      headers: {
        Authorization: `Bearer ${developerJwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    return JSON.parse(response);
  }],

	['subscribeAllVehiclesToWebhook', async (helper: DimoHelper, developerJwt: string, basePath: string) => {
		const webhookId = helper.executeFunctions.getNodeParameter('webhookId', 0) as string;

		const response = await helper.executeFunctions.helpers.request({
			method: 'POST',
			url: `${basePath}/v1/webhooks/${webhookId}/subscribe/all`,
			headers: {
				Authorization: `Bearer ${developerJwt}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({}),
		});
		return JSON.parse(response);
	}],

  ['unsubscribeVehicleFromWebhook', async (helper: DimoHelper, developerJwt: string, basePath: string) => {
    const webhookId = helper.executeFunctions.getNodeParameter('id', 0) as string;
    const tokenId = helper.executeFunctions.getNodeParameter('tokenId', 0) as string;

    const response = await helper.executeFunctions.helpers.request({
      method: 'DELETE',
      url: `${basePath}/v1/webhooks/${webhookId}/unsubscribe/${tokenId}`,
      headers: {
        Authorization: `Bearer ${developerJwt}`,
        'Content-Type': 'application/json',
      },
    });
    return JSON.parse(response);
  }],

	['unsubscribeAllVehiclesFromWebhook', async (helper: DimoHelper, developerJwt: string, basePath: string) => {
		const webhookId = helper.executeFunctions.getNodeParameter('webhookId', 0) as string;

		const response = await helper.executeFunctions.helpers.request({
			method: 'DELETE',
			url: `${basePath}/v1/webhooks/${webhookId}/unsubscribe/all`,
			headers: {
				Authorization: `Bearer ${developerJwt}`,
				'Content-Type': 'application/json',
			},
		});
		return JSON.parse(response);
	}],

  ['getVehicleWebhookSubscriptions', async (helper: DimoHelper, developerJwt: string, basePath: string) => {
    const tokenId = helper.executeFunctions.getNodeParameter('tokenId', 0) as string;

    const response = await helper.executeFunctions.helpers.request({
      method: 'GET',
      url: `${basePath}/v1/webhooks/vehicles/${tokenId.toString()}`,
      headers: {
        Authorization: `Bearer ${developerJwt}`,
        'Content-Type': 'application/json',
      },
    });
    return JSON.parse(response);
  }],

	['listVehiclesSubscribedToWebhook', async (helper: DimoHelper, developerJwt: string, basePath: string) => {
		const webhookId = helper.executeFunctions.getNodeParameter('webhookId', 0) as string;

		const response = await helper.executeFunctions.helpers.request({
			method: 'GET',
			url: `${basePath}/v1/webhooks/${webhookId}`,
			headers: {
				Authorization: `Bearer ${developerJwt}`,
				'Content-Type': 'application/json',
			},
		});
		return JSON.parse(response);
	}],

  ['getWebhookSignalNames', async (helper: DimoHelper, developerJwt: string, basePath: string) => {
    const response = await helper.executeFunctions.helpers.request({
      method: 'GET',
      url: `${basePath}/v1/webhooks/signals`,
      headers: {
        Authorization: `Bearer ${developerJwt}`,
        'Content-Type': 'application/json',
      },
    });
    return JSON.parse(response);
  }],
]);

export const vehicleEvents = {
	getProperties(): INodeProperties[] {
		return vehicleEventsProperties;
	},

	async execute(helper: DimoHelper, operation: string) {
		const developerJwt = await helper.getDeveloperJwt();

		const basePath =
			helper.credentials.environment === 'Dev'
				? 'https://vehicle-events-api.dev.dimo.zone'
				: 'https://vehicle-events-api.dimo.zone';

		const executeOperation = vehicleEventsReqs.get(operation);
		if (!executeOperation) {
			throw new Error(`The operation ${operation} is not supported.`);
		}

		return executeOperation(helper, developerJwt, basePath);
	},
};
