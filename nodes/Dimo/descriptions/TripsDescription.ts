import { INodeProperties } from "n8n-workflow";

export const tripsOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['trips'],
		},
	},
	options: [
		{
			name: 'Get Trips',
			value: 'getTrips',
			action: 'Get trips'
		},
	],
	default: 'getTrips',
};

export const tripsProperties: INodeProperties[] = [
	{
		displayName: 'Token ID',
		name: 'tokenId',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['trips'],
			},
		},
		default: 0,
		description: 'The Token ID of the vehicle you are getting trip data for',
		required: true,
	},
	{
		displayName: 'Privileges',
		name: 'privileges',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['trips'],
			},
		},
		default: '',
		description: 'Comma-separated list of privileges - e.g. 1,2,3,4,5',
		required: true,
	},
];

export const tripsDescription = {
	operations: tripsOperations,
	properties: tripsProperties,
}
