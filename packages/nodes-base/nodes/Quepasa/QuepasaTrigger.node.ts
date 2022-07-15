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
	NodeApiError,
} from 'n8n-workflow';

import {
	apiRequest,
	authorizationError,
} from './GenericFunctions';

import isbot from 'isbot';

import type { Quepasa } from './types';

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
				path: 'default',
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
			{
				displayName: 'Forward Internal',
				name: 'forwardInternal',
				type: 'boolean',
				default: false,
				description: 'Should forward internal messages sent by api',
			},
			{
				displayName: 'Track Id',
				name: 'trackId',
				type: 'string',
				default: '',
				description: '(Optional) System identifier, avoid duplicated messages',
				displayOptions: {
					show: {
						forwardInternal: [
							true,
						],
					},
				},
			},
		],
	};

	// @ts-ignore (because of request)
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');
				const forwardInternal = this.getNodeParameter('forwardInternal') as boolean;
				const trackId = this.getNodeParameter('trackId') as string;

				const headers: IDataObject = {
					'X-QUEPASA-WHURL': webhookUrl,
				};				

				// Check all the webhooks which exist already if it is identical to the
				// one that is supposed to get created.				
				const response: Quepasa.GetWebhookResponse = await apiRequest.call(this, 'GET', '', {}, {}, undefined, headers);
				if (!response.success) {
					throw new NodeApiError(this.getNode(), response as Quepasa.Response);
				}

				response.webhooks?.forEach(function (webhook) {
					if (webhook.url == webhookUrl 
						&& webhook.forwardinternal == forwardInternal
						&& webhook.trackid == trackId)
						return true;
				}); 
				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookUrl = this.getNodeWebhookUrl('default');
				const forwardInternal = this.getNodeParameter('forwardInternal') as boolean;
				const trackId = this.getNodeParameter('trackId') as string;

				const body = {
					url: webhookUrl,
					forwardinternal: forwardInternal,
					trackid: trackId,
				};

				const responseData = await apiRequest.call(this, 'POST', '/webhook', body);
				if (responseData.id === undefined) {
					// Required data is missing so was not successful
					return false;
				}

				webhookData.webhookId = responseData.id as string;
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {	
				const webhookUrl = this.getNodeWebhookUrl('default');			
				const body = { url: webhookUrl, };
				try {
					await apiRequest.call(this, 'DELETE', '/webhook', body);
					return true;
				} catch {
					return false;
				}
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
