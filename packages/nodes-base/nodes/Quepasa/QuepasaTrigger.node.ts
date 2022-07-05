import {
	IHookFunctions,
	IWebhookFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	INodeExecutionData,
} from 'n8n-workflow';

import {
	quepasaApiRequest,
	authorizationError,
} from './GenericFunctions';

import isbot from 'isbot';

// used from webhook authorization, avoid bots
import { Response } from 'express';

export class QuepasaTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Quepasa Trigger',
		name: 'quepasaTrigger',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:quepasa.png',
		group: ['trigger'],
		version: 1,
		description: 'Starts the workflow when Quepasa events occur',
		defaults: {
			name: 'Quepasa Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'quepasaTokenAuthApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Show Headers',
				name: 'showHeaders',
				type: 'boolean',
				default: true,
				description: 'Should get header parameters',
			},
		],
	};

	// @ts-ignore (because of request)
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');

				// Check all the webhooks which exist already if it is identical to the
				// one that is supposed to get created.				
				const responseData = await quepasaApiRequest.call(this, 'GET', '', {});
				return responseData.webhook == webhookUrl;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookUrl = this.getNodeWebhookUrl('default');

				const endpoint = '/webhook';
				const body = {
					url: webhookUrl,
				};

				const responseData = await quepasaApiRequest.call(this, 'POST', endpoint, body);
				if (responseData.id === undefined) {
					// Required data is missing so was not successful
					return false;
				}

				webhookData.webhookId = responseData.id as string;
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> 
	{		
		const headers = this.getHeaderData();
		const body = this.getBodyData();

		const response: INodeExecutionData = {				
			json: {
				headers,
				body,
			},
		};

		try {	
			// checking for malicius bots
			const realm = 'Webhook';
			const resp = this.getResponseObject();
			const userAgent = (headers as IDataObject)['user-agent'] as string;
			if (!userAgent.startsWith("Quepasa") && isbot(userAgent)) {
				return authorizationError(resp, realm, 403);
			}

			const showHeaders = this.getNodeParameter('showHeaders') as boolean;
			if(!showHeaders){
				delete response.json.headers;
			}

		} catch (error) {
			response.json.error = error;
		}

		// Return all the data that got received
		return {
			workflowData: [
				[
					response,
				],
			],
		};		
	}
}
