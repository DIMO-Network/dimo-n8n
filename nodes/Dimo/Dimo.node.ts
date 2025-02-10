import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	INodeExecutionData,
} from 'n8n-workflow';
import { DimoHelper } from './DimoHelper';

import { authentication } from './operations/Authentication';
import { authenticationDescription } from './descriptions/AuthDescription';
import { attestation } from './operations/Attestation';
import { attestationDescription } from './descriptions/AttestationDescription';
import { devicedefinitions } from './operations/DeviceDefinitions';
import { deviceDefinitionsDescription } from './descriptions/DeviceDefinitionsDescription';
import { identity } from './operations/Identity';
import { identityDescription } from './descriptions/IdentityDescription';
import { telemetry } from './operations/Telemetry';
import { telemetryDescription } from './descriptions/TelemetryDescription';
import { trips } from './operations/Trips';
import { tripsDescription } from './descriptions/TripsDescription';
import { valuations } from './operations/Valuations';
import { valuationsDescription } from './descriptions/ValuationsDescription';

interface DimoApiCredentials {
	clientId: string;
	redirectUri: string;
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
		hints: [
			{
				message: 'It is recommended that you test your Identity queries in the Identity API Playground before using them in n8n: https://identity-api.dimo.zone/',
				type: 'warning',
				displayCondition: '={{ $parameter["resource"] === "identity" && $parameter["operation"] === "customIdentity" }}',
			},
			{
				message: 'It is recommended that you test your Telemetry queries in the Telemetry API Playground before using them in n8n: https://telemetry-api.dimo.zone/',
				type: 'warning',
				displayCondition: '={{ $parameter["resource"] === "telemetry" && $parameter["operation"] === "customTelemetry" }}',
			}
		],
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
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Attestation API',
						value: 'attestation',
					},
					{
						name: 'Authentication API',
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
						value: 'trips',
					},
					{
						name: 'Valuations API',
						value: 'valuations',
					},
				],
				default: 'attestation',
			},
			// Authentication Options
			authenticationDescription.operations,
			...authenticationDescription.properties,
			// Attestation Options
			attestationDescription.operations,
			...attestationDescription.properties,
			// Device Definitions Options
			deviceDefinitionsDescription.operations,
			...deviceDefinitionsDescription.properties,
			// Trips Options
			tripsDescription.operations,
			...tripsDescription.properties,
			// Telemetry Options
			telemetryDescription.operations,
			...telemetryDescription.properties,
			// Identity Options
			identityDescription.operations,
			...identityDescription.properties,
			// Valuations Options
			valuationsDescription.operations,
			...valuationsDescription.properties,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];

		try {
			const credentials = (await this.getCredentials('dimoApi')) as unknown as DimoApiCredentials;
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
				case 'telemetry':
					result = await telemetry.execute(helper, operation);
					break;
				case 'identity':
					result = await identity.execute(helper, operation);
					break;
				case 'valuations':
					result = await valuations.execute(helper, operation);
					break;
				default:
					// TODO (Barrett): better errors
					throw new NodeOperationError(
						this.getNode(),
						`Error: Resource: ${resource}, Operation: ${operation}, Credentials: ${credentials}, Helper: ${helper}`,
					);
			}

			returnData.push({ json: result });
			return [returnData];
		} catch (error) {
			if (error.response) {
				throw new NodeOperationError(this.getNode(), `DIMO API Error: ${error}`);
			}
			throw error;
		}
	}
}
