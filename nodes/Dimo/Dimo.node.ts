// import { ethers } from 'ethers';
import {
  // IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

export class Dimo implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'DIMO',
    name: 'dimo',
    icon: 'file:dimo.svg',
    group: ['transform'],
    version: 1,
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
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Get Developer JWT',
            value: 'getDeveloperJwt',
          },
          {
            name: 'Get Vehicle JWT',
            value: 'getVehicleJwt',
          }
        ],
        default: 'getDeveloperJwt',
      },
      {
        displayName: 'Token ID',
        name: 'tokenId',
        type: 'number',
        displayOptions: {
          show: {
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
            operation: ['getVehicleJwt'],
          },
        },
        default: '',
        description: 'Comma-separated list of privileges',
        required: true,
      }
    ],
  };

}
