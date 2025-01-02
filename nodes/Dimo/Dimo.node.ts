import {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  INodeExecutionData,
} from 'n8n-workflow';
import { DimoHelper } from './DimoHelper';

// TODO: ADD IMPORTS
import { authentication } from './operations/Authentication'
import { attestation } from './operations/Attestation';
import { devicedefinitions } from './operations/DeviceDefinitions'
// import { identity } from './operations/Identity'
// import { telemetry } from './operations/Telemetry'
import { trips } from './operations/Trips'

interface DimoApiCredentials {
  clientId: string;
  domain: string;
  privateKey: string;
  environment: string;
}

export class Dimo implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'DIMO',
    name: 'dimo',
    icon: 'file:Dimo.svg',
    group: ['transform'],
    version: 1,
				subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
    description: 'Interact with the DIMO API',
    defaults: {
      name: 'DIMO',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'dimoApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
					{
						name: 'Attestation API',
						value: 'attestation',
					},
					{
						name: 'Authentication',
						value: 'authentication',
					},
					{
						name: 'Device Definitions API',
						value: 'devicedefinitions',
					},
					{
						name: 'Identity API',
						value: 'identity',
					},
					{
						name: 'Telemetry API',
						value: 'telemetry',
					},
					{
						name: 'Trips API',
						value: 'trips'
					}
				],
        default: 'authentication',
      },
			// Authentication Options
			{
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
            name: 'Get Developer JWT',
            value: 'getDeveloperJwt',
						action: 'Get developer jwt',
          },
          {
            name: 'Get Vehicle JWT',
            value: 'getVehicleJwt',
						action: 'Get vehicle jwt'
          },
        ],
        default: 'getDeveloperJwt',
      },
			// Attestation Options
			{
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
				noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['attestation'],
          },
        },
        options: [
          {
            name: 'Create VIN VC',
            value: 'createVinVc',
						action: 'Create vin vc'
          },
          {
            name: 'Create POM VC',
            value: 'createPomVc',
						action: 'Create pom vc'
          },
        ],
        default: 'createVinVc',
      },
			// Device Definitions Options
			{
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
				noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['devicedefinitions'],
          },
        },
        options: [
          {
            name: 'Decode VIN',
            value: 'decodeVin',
						action: 'Decode vin'
          },
          {
            name: 'Search',
            value: 'search',
						action: 'Search'
          },
        ],
        default: 'decodeVin',
      },
			// Trips Options
			{
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
      },
			// TODO: Add Rest of options

			// TODO: REMOVE COMMENT
			...authentication.getProperties(),
			...attestation.getProperties(),
			...devicedefinitions.getProperties(),
			// ...identity.getProperties(),
			// ...telemetry.getProperties(),
			...trips.getProperties(),
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const returnData: INodeExecutionData[] = [];

    try {
      const credentials = await this.getCredentials('dimoApi') as unknown as DimoApiCredentials;
      const operation = this.getNodeParameter('operation', 0) as string;
      const resource = this.getNodeParameter('resource', 0);
			const helper = new DimoHelper(this, credentials);

			let result;
			switch (resource) {
				case 'authentication':
					result = await authentication.execute(helper, operation);
					break;
				case 'attestation':
					result = await attestation.execute(helper, operation);
					break;
				case 'devicedefinitions':
					result = await devicedefinitions.execute(helper, operation);
					break;
				case 'trips':
					result = await trips.execute(helper, operation);
					break;
				default:
				// TODO (Barrett): better errors
					throw new NodeOperationError(this.getNode(), `Error: Resource: ${resource}, Operation: ${operation}, Credentials: ${credentials}, Helper: ${helper}`)
			}

			returnData.push( { json: result });
			return [returnData]

		} catch (error) {
			if (error.response) {
				throw new NodeOperationError(
					this.getNode(),
					`DIMO API Error: ${error}`
				);
			}
			throw error;
		}
	}
}
