import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ICredentialsDecrypted,
	ICredentialTestFunctions,
	ILoadOptionsFunctions,
	INodeCredentialTestResult,
	NodeOperationError,
} from 'n8n-workflow';

import {
	messageDescription, messageFields,
	webhookDescription, webhookFields,
} from '../descriptions';

import {
	apiRequest,
	requestBotInfo,
} from '../GenericFunctions';

import type { Quepasa } from '../types';

export async function resourceWebhook(this: IExecuteFunctions, operation: string, items: any, i: number): Promise<any> {
	let responseData;
	if (operation === 'find') {
		responseData = await apiRequest.call(this, 'GET', '/webhook');
	}
	else if (operation === 'setup'){
		const WebhookUrl = this.getNodeParameter('url', i) as string;
		const ForwardInternal = this.getNodeParameter('forwardInternal', i) as boolean;
		const TrackId = this.getNodeParameter('trackId', i) as string;
		let body: Quepasa.Webhook = {
			url: WebhookUrl,
			forwardinternal: ForwardInternal,
			trackid: TrackId,
		};
		responseData = await apiRequest.call(this, 'POST', '/webhook', body);
	}
	else if (operation === 'remove') {
		const WebhookUrl = this.getNodeParameter('url', i) as string;
		let body: Quepasa.Webhook = {
			url: WebhookUrl,
		};
		responseData = await apiRequest.call(this, 'DELETE', '/webhook', body);
	}
	else if (operation === 'clear') {
		responseData = await apiRequest.call(this, 'DELETE', '/webhook');
	}

	return responseData;
}
