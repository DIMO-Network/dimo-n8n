import { INodeProperties } from 'n8n-workflow';
import { agentsProperties } from '../descriptions/AgentsDescription';
import { DimoHelper } from '../DimoHelper';

const AGENTS_BASE_URL = 'https://agents.dimo.zone';

const agentsReqs = new Map([
	['createAgent', async (helper: DimoHelper, devJwt: string) => {
		const personality = helper.executeFunctions.getNodeParameter('personality', 0) as string;
		const userWallet = helper.executeFunctions.getNodeParameter('userWallet', 0) as string;
		const vehicleIdsStr = helper.executeFunctions.getNodeParameter('vehicleIds', 0) as string;

		const variables: Record<string, string> = {
			USER_WALLET: userWallet,
		};

		if (vehicleIdsStr && vehicleIdsStr.trim()) {
			variables.VEHICLE_IDS = vehicleIdsStr;
		}

		const requestBody = {
			type: 'driver_agent_v1',
			personality,
			secrets: {
				DIMO_API_KEY: helper.credentials.apiKey,
			},
			variables,
		};

		const response = await helper.executeFunctions.helpers.request({
			method: 'POST',
			url: `${AGENTS_BASE_URL}/agents`,
			headers: {
				Authorization: `Bearer ${devJwt}`,
				'Content-Type': 'application/json',
				'User-Agent': 'dimo-n8n-node',
			},
			body: JSON.stringify(requestBody),
		});

		return JSON.parse(response);
	}],

	['deleteAgent', async (helper: DimoHelper, devJwt: string) => {
		const agentId = helper.executeFunctions.getNodeParameter('agentId', 0) as string;

		const response = await helper.executeFunctions.helpers.request({
			method: 'DELETE',
			url: `${AGENTS_BASE_URL}/agents/${agentId}`,
			headers: {
				Authorization: `Bearer ${devJwt}`,
				'Content-Type': 'application/json',
				'User-Agent': 'dimo-n8n-node',
			},
		});

		return typeof response === 'string' ? JSON.parse(response) : response;
	}],

	['sendMessage', async (helper: DimoHelper, devJwt: string) => {
		const agentId = helper.executeFunctions.getNodeParameter('agentId', 0) as string;
		const message = helper.executeFunctions.getNodeParameter('message', 0) as string;

		const response = await helper.executeFunctions.helpers.request({
			method: 'POST',
			url: `${AGENTS_BASE_URL}/agents/${agentId}/message`,
			headers: {
				Authorization: `Bearer ${devJwt}`,
				'Content-Type': 'application/json',
				'User-Agent': 'dimo-n8n-node',
			},
			body: JSON.stringify({ message }),
		});

		return JSON.parse(response);
	}],

	['streamMessage', async (helper: DimoHelper, devJwt: string) => {
		const agentId = helper.executeFunctions.getNodeParameter('agentId', 0) as string;
		const message = helper.executeFunctions.getNodeParameter('message', 0) as string;

		const response = await helper.executeFunctions.helpers.request({
			method: 'POST',
			url: `${AGENTS_BASE_URL}/agents/${agentId}/stream`,
			headers: {
				Authorization: `Bearer ${devJwt}`,
				'Content-Type': 'application/json',
				Accept: 'text/event-stream',
				'User-Agent': 'dimo-n8n-node',
			},
			body: JSON.stringify({ message }),
		});

		// Parse SSE response and concatenate content
		const lines = response.split('\n');
		let fullContent = '';
		let metadata: Record<string, unknown> = {};

		for (const line of lines) {
			if (line.startsWith('data: ')) {
				try {
					const data = JSON.parse(line.substring(6));
					if (data.content) {
						fullContent += data.content;
					}
					if (data.done) {
						metadata = {
							done: data.done,
							agentId: data.agentId,
							vehiclesQueried: data.vehiclesQueried,
						};
					}
				} catch {
					// Skip malformed data lines
				}
			}
		}

		return {
			agentId,
			message,
			response: fullContent,
			...metadata,
		};
	}],

	['getHistory', async (helper: DimoHelper, devJwt: string) => {
		const agentId = helper.executeFunctions.getNodeParameter('agentId', 0) as string;
		const limit = helper.executeFunctions.getNodeParameter('limit', 0) as number;

		const response = await helper.executeFunctions.helpers.request({
			method: 'GET',
			url: `${AGENTS_BASE_URL}/agents/${agentId}/history?limit=${limit}`,
			headers: {
				Authorization: `Bearer ${devJwt}`,
				'Content-Type': 'application/json',
				'User-Agent': 'dimo-n8n-node',
			},
		});

		return JSON.parse(response);
	}],
]);

export const agents = {
	getProperties(): INodeProperties[] {
		return agentsProperties;
	},

	async execute(helper: DimoHelper, operation: string) {
		const developerJwt = await helper.getDeveloperJwt();

		const executeOperation = agentsReqs.get(operation);
		if (!executeOperation) {
			throw new Error(`The operation ${operation} is not supported.`);
		}

		return executeOperation(helper, developerJwt);
	},
};
