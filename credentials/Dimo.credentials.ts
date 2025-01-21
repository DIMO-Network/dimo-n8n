import {
	IAuthenticate,
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow'

export class DimoApi implements ICredentialType {
	name = 'dimoApi';
	displayName = 'DIMO API';
	documentationUrl = 'https://docs.dimo.org/developer-platform'
	properties: INodeProperties[] = [
		{
			displayName: 'Client ID',
			name: 'client_id',
			type: 'string',
			default: '',
			description: 'Your DIMO client_id from your app in the dev console.',
			required: true,
		},
		{
			displayName: 'Domain',
			name: 'domain',
			type: 'string',
			default: '',
			description: 'Your DIMO domain from your app in the dev console.',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'private_key',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Your API key, or private key, from your app in the dev console.',
			required: true,
		},
		{
			displayName: 'Environment',
			name: 'envrionment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Development',
					value: 'dev',
				},
			],
			default: 'production',
			description: 'The DIMO environment you want to connect to.',
		},
		{
			displayName: 'API Config',
			name: 'apiConfig',
			type: 'hidden',
			default: {
				productionAuthUrl: 'https://auth.dimo.zone',
				devAuthUrl: 'https://auth.dev.dimo.zone',
				authEndpoints: {
					generateChallenge: '/auth/web3/generate_challenge',
					submitChallenge: '/auth/web3/submit_challenge',
				},
			},
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				// TODO: Update/include execute()
				Authorization: '=Bearer {{$crdentials.apiKey}}',
			}
		}
	}
}
