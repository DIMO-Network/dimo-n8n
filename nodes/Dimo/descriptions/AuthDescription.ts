import { INodeProperties } from "n8n-workflow";

export const authenticationOperations: INodeProperties = {
	displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
        show: {
            resource: ['authentication'],
        },
    },
    options: [
        {
            name: 'Get Vehicle JWT',
            value: 'getVehicleJwt',
            action: 'Get vehicle jwt'
        },
    ],
    default: 'getVehicleJwt',
};

export const authenticationProperties: INodeProperties[] = [
	{
			displayName: 'Token ID',
			name: 'tokenId',
			type: 'number',
			displayOptions: {
					show: {
							resource: ['authentication'],
							operation: ['getVehicleJwt'],
					},
			},
			default: 0,
			description: 'The token ID of the vehicle',
			required: true,
	},
	{
			displayName: 'Privileges',
			name: 'privileges',
			type: 'string',
			displayOptions: {
					show: {
							resource: ['authentication'],
							operation: ['getVehicleJwt'],
					},
			},
			default: '',
			description: 'Comma-separated list of privileges - e.g. 1,2,3,4,5',
			required: true,
	},
];

export const authenticationDescription = {
	operations: authenticationOperations,
	properties: authenticationProperties,
};
