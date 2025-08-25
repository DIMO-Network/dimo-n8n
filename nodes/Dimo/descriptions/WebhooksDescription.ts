import { INodeProperties } from 'n8n-workflow';

export const webhooksOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['webhooks'],
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

export const webhooksProperties: INodeProperties[] = [
	{
		displayName: 'Service',
		name: 'service',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: 'telemetry.signals',
		description: 'The service to register the webhook for. Default is telemetry.signals.',
		required: true,
	},
	{
		displayName: 'Metric Name',
		name: 'metricName',
		type: 'options',
		options: [
			{
				name: 'Battery Current Power',
				value: 'powertrainTractionBatteryCurrentPower',
				description: 'Current electrical energy flowing in/out of battery. Positive = Energy flowing in to battery, e.g. during charging. Negative = Energy flowing out of battery, e.g. during driving.',
		},
			{
				name: 'Battery Is Charging',
				value: 'powertrainTractionBatteryChargingIsCharging',
				description: 'True if charging is ongoing. Charging is considered to be ongoing if energy is flowing from charger to vehicle. True (1) - Vehicle is charging.False (0) - Vehicle is not charging.',
			},
			{
				name: 'Charge Level',
				value: 'powertrainTractionBatteryStateOfChargeCurrent',
				description: 'Physical state of charge of the high voltage battery, relative to net capacity. This is not necessarily the state of charge being displayed to the customer.',
			},
			{
				name: 'Fuel Level in Liters',
				value: 'powertrainFuelSystemAbsoluteLevel',
				description: 'Current available fuel in the fuel tank expressed in liters',
			},
			{
				name: 'Fuel Level Percentage',
				value: 'powertrainFuelSystemRelativeLevel',
				description: 'Current available fuel in the fuel tank in %, from 0 to 100',
			},
			{
				name: 'Is Ignition On',
				value: 'isIgnitionOn',
				description: 'Vehicle ignition status. True (1) = Vehicle Ignition On. False (0) = Vehicle Ignition Off',
			},
			{
				name: 'Odometer',
				value: 'powertrainTransmissionTravelledDistance',
				description: 'Odometer reading in kilometers, total distance travelled during the lifetime of the transmission',
			},
			{
				name: 'Speed',
				value: 'speed',
				description: 'The vehicle speed in km/hr',
			},
			{
				name: 'Tire Pressure - Back Left',
				value: 'chassisAxleRow2WheelLeftTirePressure',
				description: 'Tire pressure of the rear left tire in kilo-Pascal',
			},
			{
				name: 'Tire Pressure - Back Right',
				value: 'chassisAxleRow2WheelRightTirePressure',
				description: 'Tire pressure of the rear right tire in kilo-Pascal',
			},
			{
				name: 'Tire Pressure - Front Left',
				value: 'chassisAxleRow1WheelLeftTirePressure',
				description: 'Tire pressure of the front left tire in kilo-Pascal',
			},
			{
				name: 'Tire Pressure - Front Right',
				value: 'chassisAxleRow1WheelRightTirePressure',
				description: 'Tire pressure of the front right tire in kilo-Pascal',
			},
		],
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: 'powertrainTransmissionTravelledDistance',
		description: 'The metric name that the webhook will listen for events on',
		required: true,
	},
	{
		displayName: 'Condition',
		name: 'condition',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: 'value > 0',
		description: 'The condition that the webhook will be listening for. You can use the following condition statements &gt;= , &lt;=, &gt;, &lt;, =.',
		required: true,
	},
	{
		displayName: 'Cool Down Period',
		name: 'coolDownPeriod',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: 30,
		description: 'Number of seconds that must elapse before the webhook can be triggered again',
		required: true,
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: '',
		description: 'A description of the webhook for your records',
		required: true,
	},
	{
		displayName: 'Display Name',
		name: 'displayName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: '',
		description: 'A display name for the webhook (optional)',
	},
	{
		displayName: 'Target URL',
		name: 'targetURL',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: '',
		description: 'The URL that the webhook will send the event to',
		required: true,
	},
	{
		displayName: 'Verification Token',
		name: 'verificationToken',
		// eslint-disable-next-line n8n-nodes-base/node-param-type-options-password-missing
		type: 'string',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: '',
		description: 'The plain/text string that must be returned by your target URL webhook listener',
		required: true,
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{
				name: 'Enabled',
				value: 'enabled',
				description: 'Webhook is active and will trigger',
			},
			{
				name: 'Disabled',
				value: 'disabled',
				description: 'Webhook is inactive and will not trigger',
			},
		],
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['registerWebhook', 'updateWebhook'],
			},
		},
		default: 'enabled',
		description: 'The status of the webhook',
		required: true,
	},
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['deleteWebhook', 'updateWebhook', 'subscribeVehicleToWebhook', 'unsubscribeVehicleFromWebhook', 'subscribeAllVehiclesToWebhook', 'unsubscribeAllVehiclesFromWebhook', 'listVehiclesSubscribedToWebhook'],
			},
		},
		default: '',
		description: 'The ID of the webhook that you are deleting or updating',
		required: true,
	},
	{
		displayName: 'Token DID',
		name: 'tokenDid',
		// eslint-disable-next-line n8n-nodes-base/node-param-type-options-password-missing
		type: 'string',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['subscribeVehicleToWebhook', 'unsubscribeVehicleFromWebhook', 'getVehicleWebhookSubscriptions'],
			},
		},
		default: '',
		description: 'The Token DID of the vehicle for the webhook subscription',
		required: true,
	},
];

export const webhooksDescription = {
	operations: webhooksOperations,
	properties: webhooksProperties,
};
