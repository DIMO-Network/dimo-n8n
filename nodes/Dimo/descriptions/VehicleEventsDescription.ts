import { INodeProperties } from 'n8n-workflow';

export const vehicleEventsOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['vehicleevents'],
		},
	},
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
			name: 'List Vehicles Subscribed to Webhook',
			value: 'listVehiclesSubscribedToWebhook',
			action: 'List vehicles subscribed to webhook',
		},
		{
			name: 'Register Webhook',
			value: 'registerWebhook',
			action: 'Register webhook',
		},
		{
			name: 'Subscribe All Vehicles to Webhook',
			value: 'subscribeAllVehiclesToWebhook',
			action: 'Subscribe all vehicles to webhook',
		},
		{
			name: 'Subscribe Vehicle to Webhook',
			value: 'subscribeVehicleToWebhook',
			action: 'Subscribe vehicle to webhook',
		},
		{
			name: 'Unsubscribe All Vehicles From Webhook',
			value: 'unsubscribeAllVehiclesFromWebhook',
			action: 'Unsubscribe all vehicles from webhook',
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

export const vehicleEventsProperties: INodeProperties[] = [
	{
		displayName: 'Service',
		name: 'service',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['vehicleevents'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: 'Telemetry',
		description: 'The service to register the webhook for. Default is Telemetry.',
		required: true,
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['vehicleevents'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: '',
		description: 'The Telemetry field that the webhook will listen for events on',
		required: true,
	},
	{
		displayName: 'Trigger',
		name: 'trigger',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['vehicleevents'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: 'valueNumber',
		description: 'The trigger that the webhook will be listening for. You can use the following condition statements &gt;= , &lt;=, &gt;, &lt;, =.',
		required: true,
	},
	{
		displayName: 'Setup',
		name: 'setup',
		type: 'options',
		options: [
			{
				name: 'Realtime',
				value: 'Realtime',
				description: 'Continues firing as long as the condition remains true',
			},
			{
				name: 'Hourly',
				value: 'Hourly',
				description: 'Fires every hour as long as the condition remains true',
			},
			{
				name: 'Daily',
				value: 'Daily',
				description: 'Fires every day as long as the condition remains true',
			},
		],
		displayOptions: {
			show: {
				resource: ['vehicleevents'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: 'Realtime',
		description: 'How often the webhook should fire when conditions are met',
		required: true,
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['vehicleevents'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: '',
		description: 'A description of the webhook for your records',
		required: true,
	},
	{
		displayName: 'Target URI',
		name: 'targetUri',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['vehicleevents'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: '',
		description: 'The URI that the webhook will send the event to',
		required: true,
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['vehicleevents'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: 'Active',
		description: 'The status of the webhook',
		required: true,
	},
	{
		displayName: 'Verification Token',
		name: 'verificationToken',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['vehicleevents'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: '',
		description: 'The plain/text string that must be returned by your target_uri webhook listener',
		required: true,
	},
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['vehicleevents'],
				operation: ['deleteWebhook', 'updateWebhook', 'subscribeVehicleToWebhook', 'unsubscribeVehicleFromWebhook', 'subscribeAllVehiclesToWebhook', 'unsubscribeAllVehiclesFromWebhook', 'listVehiclesSubscribedToWebhook'],
			},
		},
		default: '',
		description: 'The ID of the webhook that you are deleting or updating',
		required: true,
	},
	{
		displayName: 'Token ID',
		name: 'tokenId',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['vehicleevents'],
				operation: ['subscribeVehicleToWebhook', 'unsubscribeVehicleFromWebhook', 'getVehicleWebhookSubscriptions'],
			},
		},
		default: 0,
		description: 'The Token ID of the vehicle for the webhook subscription',
		required: true,
	},
];

export const vehicleEventsDescription = {
	operations: vehicleEventsOperations,
	properties: vehicleEventsProperties,
};
