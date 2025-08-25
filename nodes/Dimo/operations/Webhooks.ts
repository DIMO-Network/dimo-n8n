import { INodeProperties } from 'n8n-workflow';
import { webhooksProperties } from '../descriptions/WebhooksDescription';
import { DimoHelper } from '../DimoHelper';

const webhooksReqs = new Map([
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
    const metricName = helper.executeFunctions.getNodeParameter('metricName', 0) as string;
    const condition = helper.executeFunctions.getNodeParameter('condition', 0) as string;
    const coolDownPeriod = helper.executeFunctions.getNodeParameter('coolDownPeriod', 0) as number;
    const description = helper.executeFunctions.getNodeParameter('description', 0) as string;
    const displayName = helper.executeFunctions.getNodeParameter('displayName', 0) as string;
    const targetURL = helper.executeFunctions.getNodeParameter('targetURL', 0) as string;
    const status = helper.executeFunctions.getNodeParameter('status', 0) as string;
		const verificationToken = helper.executeFunctions.getNodeParameter('verificationToken', 0) as string;

    const response = await helper.executeFunctions.helpers.request({
      method: 'POST',
      url: `${basePath}/v1/webhooks`,
      headers: {
        Authorization: `Bearer ${developerJwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service,
        metricName,
        condition,
        coolDownPeriod,
        description,
        displayName,
        targetURL,
        status,
        verificationToken,
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
    const metricName = helper.executeFunctions.getNodeParameter('metricName', 0) as string;
    const condition = helper.executeFunctions.getNodeParameter('condition', 0) as string;
    const coolDownPeriod = helper.executeFunctions.getNodeParameter('coolDownPeriod', 0) as number;
    const description = helper.executeFunctions.getNodeParameter('description', 0) as string;
    const displayName = helper.executeFunctions.getNodeParameter('displayName', 0) as string;
    const targetURL = helper.executeFunctions.getNodeParameter('targetURL', 0) as string;
    const status = helper.executeFunctions.getNodeParameter('status', 0) as string;
		const verificationToken = helper.executeFunctions.getNodeParameter('verificationToken', 0) as string;

    const response = await helper.executeFunctions.helpers.request({
      method: 'PUT',
      url: `${basePath}/v1/webhooks/${webhookId}`,
      headers: {
        Authorization: `Bearer ${developerJwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service,
        metricName,
        condition,
        coolDownPeriod,
        description,
        displayName,
        targetURL,
        status,
        verificationToken,
      }),
    });
    return JSON.parse(response);
  }],

  ['subscribeVehicleToWebhook', async (helper: DimoHelper, developerJwt: string, basePath: string) => {
    const webhookId = helper.executeFunctions.getNodeParameter('webhookId', 0) as string;
    const tokenDid = helper.executeFunctions.getNodeParameter('tokenDid', 0) as string;

    const response = await helper.executeFunctions.helpers.request({
      method: 'POST',
      url: `${basePath}/v1/webhooks/${webhookId}/subscribe/${tokenDid}`,
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
    const webhookId = helper.executeFunctions.getNodeParameter('webhookId', 0) as string;
    const tokenDid = helper.executeFunctions.getNodeParameter('tokenDid', 0) as string;

    const response = await helper.executeFunctions.helpers.request({
      method: 'DELETE',
      url: `${basePath}/v1/webhooks/${webhookId}/unsubscribe/${tokenDid}`,
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
    const tokenDid = helper.executeFunctions.getNodeParameter('tokenDid', 0) as string;

    const response = await helper.executeFunctions.helpers.request({
      method: 'GET',
      url: `${basePath}/v1/webhooks/vehicles/${tokenDid}`,
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

export const webhooks = {
	getProperties(): INodeProperties[] {
		return webhooksProperties;
	},

	async execute(helper: DimoHelper, operation: string) {
		const developerJwt = await helper.getDeveloperJwt();

		const basePath =
			helper.credentials.environment === 'Dev'
				? 'https://vehicle-triggers-api.dev.dimo.zone'
				: 'https://vehicle-triggers-api.dimo.zone';

		const executeOperation = webhooksReqs.get(operation);
		if (!executeOperation) {
			throw new Error(`The operation ${operation} is not supported.`);
		}

		return executeOperation(helper, developerJwt, basePath);
	},
};
