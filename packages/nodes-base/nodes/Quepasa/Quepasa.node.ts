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
} from './descriptions';

import {
	resourceMessage,
	resourceWebhook,
} from './methods';

import {
	apiRequest,
	requestBotInfo,
} from './GenericFunctions';

import type { Quepasa as Types } from './types';

export class Quepasa implements INodeType {
	description: INodeTypeDescription = {
			displayName: 'Quepasa (Whatsapp)',
			name: 'quepasa',
			icon: 'file:quepasa.png',
			group: ['output'],
			version: 1,
			subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
			description: 'Non Official Whatsapp API',
			defaults: {
					name: 'Quepasa',
					color: '#1A82e2',
			},
			inputs: ['main'],
			outputs: ['main'],
			credentials: [
				{
					name: 'quepasaTokenAuthApi',
					testedBy: 'quepasaTokenAuthApiTest',
					required: true,
					displayOptions: {
						show: {
							authentication: [
								'predefinedCredentialType',
							],
						},
					},
				},
			],
			properties: [
				{
					displayName: 'Authentication',
					name: 'authentication',
					noDataExpression: true,
					type: 'options',
					required: true,
					options: [
						{
							name: 'Parameters',
							value: 'parametersCredentialType',
						},
						{
							name: 'Predefined Quepasa Credentials',
							value: 'predefinedCredentialType',
							description: 'BaseUrl + Token',
						},
					],
					default: 'parametersCredentialType',
				},
				{
					displayName: 'BaseUrl',
					name: 'baseUrl',
					type: 'string',
					default: '',
					required: true,
					description: 'Base Url',
					placeholder: 'https://api.quepasa.org:31000',
					displayOptions: {
						show: {
							authentication: [
								'parametersCredentialType',
							],
						},
					},
				},
				{
					displayName: 'Token',
					name: 'token',
					type: 'string',
					default: '',
					required: true,
					description: 'Token of Whatsapp bot, override credentials',
					placeholder: '00000000-0000-0000-0000-000000000000',
					displayOptions: {
						show: {
							authentication: [
								'parametersCredentialType',
							],
						},
					},
				},
				{
					displayName: 'Resource',
					name: 'resource',
					type: 'options',
					noDataExpression: true,
					options: [
						{
							name: 'Information',
							value: 'information',
						},
						{
							name: 'Message',
							value: 'message',
						},
						{
							name: 'Webhook',
							value: 'webhook',
						},
					],
					default: 'message',
					required: true,
				},
				{
					displayName: 'Operation',
					name: 'operation',
					type: 'hidden',
					noDataExpression: true,
					displayOptions: {
						show: {
							resource: [
								'information',
							],
						},
					},
					default: 'information',
					required: true,
				},
				...messageDescription,
				...messageFields,
				...webhookDescription,
				...webhookFields,
			],
	};

	methods = {
		credentialTest: {
			async quepasaTokenAuthApiTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				const credentials = credential.data as Types.PathCredentials;
				const options = requestBotInfo(credentials)
				try {
					await this.helpers.request(options);
					return {
						status: 'OK',
						message: 'Authentication successful',
					};
				} catch (error) {
					return {
						status: 'Error',
						message: error.message,
					};
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const resource = this.getNodeParameter('resource', 0) as Types.Resource;
		const operation = this.getNodeParameter('operation', 0) as string;
		const returnData: IDataObject[] = [];

		for (let i = 0; i < items.length; i++) {
			let responseData;
			try {
				if (resource === 'information'){
					responseData = await apiRequest.call(this, 'GET');
				}
				else if (resource === 'message') {
					responseData = await resourceMessage.call(this, operation, items, i)
				}
				else if (resource === 'webhook') {
					responseData = await resourceWebhook.call(this, operation, items, i)
				}

				if (Array.isArray(responseData)) {
					returnData.push.apply(returnData, responseData as IDataObject[]);
				} else if (responseData !== undefined) {
					returnData.push(responseData as IDataObject);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					if (operation === 'download') {
						items[i].json = { error: error.message };
					} else {
						returnData.push({ error: error.message });
					}
					continue;
				}
				throw error;
			}
		}

		if (operation === 'download') {
			// For file downloads the files get attached to the existing items
			return this.prepareOutputData(items);
		} else {
			// For all other ones does the output items get replaced
			return [this.helpers.returnJsonArray(returnData)];
		}
	}
}
