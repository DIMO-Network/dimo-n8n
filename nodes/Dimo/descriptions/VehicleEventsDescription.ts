import { INodeProperties } from 'n8n-workflow';

export const vehicleEventsOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['vehicleEvents'],
		},
	},
	// BARRETT TO DO: Separate by Webhooks vs Vehicle
	options: [
		{
			name: 'Delete Webhook',
			value: 'deleteWebhook',
			action: 'Delete webhook',
		},
		{
			name: 'Get All Webhooks',
			value: 'getAllWebhooks',
			action: 'Get all webhooks',
		},
		{
			name: 'Get Vehicle Webhook Subscriptions',
			value: 'getVehicleWebhookSubscriptions',
			action: 'Get vehicle webhook subscriptions',
		},
		{
			name: 'Get Webhook Signal Names',
			value: 'getWebhookSignalNames',
			action: 'Get webhook signal names',
		},
		{
			name: 'Register Webhook',
			value: 'registerWebhook',
			action: 'Register webhook',
		},
		{
			name: 'Subscribe Vehicle to Webhook',
			value: 'subscribeVehicleToWebhook',
			action: 'Subscribe vehicle to webhook',
		},
		{
			name: 'Unsubscribe Vehicle From Webhook',
			value: 'unsubscribeVehicleFromWebhook',
			action: 'Unsubscribe vehicle from webhook',
		},
		{
			name: 'Update Webhook',
			value: 'updateWebhook',
			action: 'Update webhook',
		}
	],
	default: 'getAllWebhooks',
};

