import { INodeProperties } from 'n8n-workflow';

export const agentsOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['agents'],
		},
	},
	options: [
		{
			name: 'Create Agent',
			value: 'createAgent',
			action: 'Create an agent',
			description: 'Create a new conversational AI agent',
		},
		{
			name: 'Delete Agent',
			value: 'deleteAgent',
			action: 'Delete an agent',
			description: 'Permanently delete an agent and all associated resources',
		},
		{
			name: 'Get History',
			value: 'getHistory',
			action: 'Get conversation history',
			description: 'Retrieve the conversation history for an agent',
		},
		{
			name: 'Send Message',
			value: 'sendMessage',
			action: 'Send a message',
			description: 'Send a message to an agent and receive the complete response',
		},
		{
			name: 'Stream Message',
			value: 'streamMessage',
			action: 'Stream a message',
			description: 'Send a message and receive a streaming response',
		},
	],
	default: 'createAgent',
};

export const agentsProperties: INodeProperties[] = [
	// Create Agent properties
	{
		displayName: 'Personality',
		name: 'personality',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['agents'],
				operation: ['createAgent'],
			},
		},
		options: [
			{
				name: 'Concierge',
				value: 'concierge',
				description: 'Premium service advisor',
			},
			{
				name: 'Driving Enthusiast',
				value: 'driving_enthusiast',
				description: 'Performance-focused, excited about telemetry',
			},
			{
				name: 'Fleet Manager Pro',
				value: 'fleet_manager_pro',
				description: 'Business-focused, ROI-minded fleet advisor',
			},
			{
				name: 'Master Technician',
				value: 'master_technician',
				description: 'Methodical diagnostic expert',
			},
			{
				name: 'Uncle Mechanic',
				value: 'uncle_mechanic',
				description: 'Warm, experienced uncle with 30+ years under the hood',
			},
		],
		default: 'uncle_mechanic',
		description: 'The personality preset for the agent',
	},
	{
		displayName: 'User Wallet',
		name: 'userWallet',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['agents'],
				operation: ['createAgent'],
			},
		},
		default: '',
		placeholder: '0x86b04f6d1D9E79aD7eB31cDEAF37442B00d64605',
		description: 'The Ethereum wallet address of the user',
		required: true,
	},
	{
		displayName: 'Vehicle IDs',
		name: 'vehicleIds',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['agents'],
				operation: ['createAgent'],
			},
		},
		default: '',
		placeholder: '[1, 2, 3]',
		description: 'JSON array of vehicle token IDs the agent can access (optional)',
	},
	// Agent ID for operations that need it
	{
		displayName: 'Agent ID',
		name: 'agentId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['agents'],
				operation: ['deleteAgent', 'sendMessage', 'streamMessage', 'getHistory'],
			},
		},
		default: '',
		placeholder: 'agent-abc123def456',
		description: 'The unique identifier of the agent',
		required: true,
	},
	// Send Message / Stream Message properties
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				resource: ['agents'],
				operation: ['sendMessage', 'streamMessage'],
			},
		},
		default: '',
		placeholder: "What's the make and model of my vehicle?",
		description: 'The message or question to send to the agent',
		required: true,
	},
	// Get History properties
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['agents'],
				operation: ['getHistory'],
			},
		},
		default: 50,
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
		},
	},
];

export const agentsDescription = {
	operations: agentsOperations,
	properties: agentsProperties,
};
