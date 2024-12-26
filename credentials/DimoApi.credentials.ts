import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow'

export class DimoApi implements ICredentialType {
  name = 'dimoApi';
  displayName = 'DIMO API';
  documentationUrl = 'https://docs.dimo.org/developer-platform';

  properties: INodeProperties[] = [
    {
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      default: '',
      description: 'Your Ethereum address that serves as the client ID from your DIMO app',
      required: true,
    },
    {
      displayName: 'Domain',
      name: 'domain',
      type: 'string',
      default: '',
      description: 'The domain associated with your DIMO app',
      required: true,
    },
    {
      displayName: 'Private Key',
      name: 'privateKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Your Ethereum private key for signing authentication challenges',
      required: true,
    },
    {
      displayName: 'Environment',
      name: 'environment',
      type: 'options',
      options: [
        {
          name: 'Production',
          value: 'Production',
        },
        {
          name: 'Development',
          value: 'Dev',
        },
      ],
      default: 'Production',
    }
  ];
}

export default DimoApi;
