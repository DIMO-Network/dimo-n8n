import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions
} from 'n8n-workflow';

export class Dimo implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'DIMO',
        name: 'dimo',
        version: 1,
        icon: 'file:Dimo.svg',
        group: ['input'],
		description: 'DIMO API',
        defaults: {
			name: 'DIMO',
		},
        inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
        properties: [
            {
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Attestation',
						value: 'attestation',
					},
					{
						name: 'Auth',
						value: 'auth',
					},
					{
						name: 'DeviceData',
						value: 'deviceData',
					},
					{
						name: 'DeviceDefinitions',
						value: 'deviceDefinitions',
					},
					{
						name: 'Devices',
						value: 'devices',
					},
                    {
						name: 'Identity',
						value: 'identity',
					},
                    {
						name: 'Telemetry',
						value: 'telemetry',
					},
					{
						name: 'TokenExchange',
						value: 'tokenExchange',
					},
					{
						name: 'Trips',
						value: 'trips',
					},
					{
						name: 'User',
						value: 'user',
					},
					{
						name: 'Valuations',
						value: 'valuations',
					},
                    {
						name: 'VehicleSignalDecoding',
						value: 'vehicleSignalDecoding',
					},
				],
				default: 'auth',
				description: 'The resource to perform operations on',
			},
        ]
    }
}
