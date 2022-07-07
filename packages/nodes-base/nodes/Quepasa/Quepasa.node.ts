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
	apiRequest,
	requestBotInfo,
} from './GenericFunctions';

import type { Quepasa as Types } from './types';

export class Quepasa implements INodeType {
	description: INodeTypeDescription = {
			displayName: 'Quepasa (Whatsapp)',
			name: 'quepasa',
			icon: 'file:quepasa.png',
			group: ['transform'],
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

		let responseData;
		const returnData: IDataObject[] = [];

		for (let i = 0; i < items.length; i++) {

			try {
				if (resource === 'message') {
					if (operation === 'download') {
						const qs: IDataObject = {};
						const objectId = this.getNodeParameter('messageId', i) as string;
						qs.id = objectId;
						responseData = await apiRequest.call(this, 'GET', '/download/message', {}, qs);

						const newItem: INodeExecutionData = {
							json: items[i].json,
							binary: {},
						};

						if (items[i].binary !== undefined) {
							// Create a shallow copy of the binary data so that the old
							// data references which do not get changed still stay behind
							// but the incoming data does not get changed.
							Object.assign(newItem.binary, items[i].binary);
						}

						items[i] = newItem;

						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
						items[i].binary![binaryPropertyName] = await this.helpers.prepareBinaryData(responseData.data);
						if(!items[i].binary![binaryPropertyName].fileName)
							items[i].binary![binaryPropertyName].fileName = "unknownFileName";
					}
				}
			
				if (Array.isArray(responseData)) {
					returnData.push.apply(returnData, responseData as IDataObject[]);
				} else if (responseData !== undefined) {
					returnData.push(responseData as IDataObject);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					if (resource === 'message' && operation === 'download') {
						items[i].json = { error: error.message };
					} else {
						returnData.push({ error: error.message });
					}
					continue;
				}
				throw error;
			}
		}

		if (resource === 'message' && operation === 'download') {
			// For file downloads the files get attached to the existing items
			return this.prepareOutputData(items);
		} else {
			// For all other ones does the output items get replaced
			return [this.helpers.returnJsonArray(returnData)];
		}
	}
}