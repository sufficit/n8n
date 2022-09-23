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
	contactDescription, contactFields,
	groupDescription,
	organizationDescription,
	ticketDescription,
	userDescription,
} from './descriptions';

import {
	requestAccessToken,
	requestUserInfo,
	sufficitApiRequest,
	sufficitApiRequestAllItems,
} from './GenericFunctions';

import type { Sufficit as Types } from './types';

export class Sufficit implements INodeType {
	description: INodeTypeDescription = {
			displayName: 'Sufficit',
			name: 'sufficit',
			// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
			icon: 'file:sufficit.png',
			group: ['transform'],
			version: 1,
			subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
			description: 'Consume Sufficit API',
			defaults: {
					name: 'Sufficit',
					color: '#1A82e2',
			},
			inputs: ['main'],
			outputs: ['main'],
			credentials: [				
				{
					name: 'sufficitBasicAuthApi',
					required: false,
					testedBy: 'sufficitBasicAuthApiTest',
					displayOptions: {
						show: {
							authentication: [
								'basicAuth',
							],
						},
					},
				},
				{
					name: 'sufficitTokenAuthApi',
					required: false,
					testedBy: 'sufficitTokenAuthApiTest',
					displayOptions: {
						show: {
							authentication: [
								'tokenAuth',
							],
						},
					},
				},
			],
			properties: [
				{
					displayName: 'Authentication',
					name: 'authentication',
					type: 'options',
					options: [
						{
							name: 'Basic Auth',
							value: 'basicAuth',
						},
						{
							name: 'Token Auth',
							value: 'tokenAuth',
						},
					],
					default: 'tokenAuth',
				},
				{
					displayName: 'Resource',
					name: 'resource',
					type: 'options',
					noDataExpression: true,
					options: [
						{
							name: 'Contact',
							value: 'contact',
						},
					],
					default: 'contact',
					required: true,
				},
				...contactDescription,
				...contactFields,

				...groupDescription,
				...organizationDescription,
				...ticketDescription,
				...userDescription,
			],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const resource = this.getNodeParameter('resource', 0) as Types.Resource;
		const operation = this.getNodeParameter('operation', 0) as string;

		let responseData;
		const returnData: IDataObject[] = [];

		for (let i = 0; i < items.length; i++) {

			try {

				if (resource === 'contact') {
					if (operation === 'find') {
						const qs: IDataObject = {};
						const contactId = this.getNodeParameter('contactId', i) as string;
						qs.id = contactId;
						responseData = await sufficitApiRequest.call(this, 'GET', '/contact', {}, qs);
					} else if (operation === 'where') {
						const qs: IDataObject = {};

						const { sortUi, ...rest } = this.getNodeParameter('filters', i) as Types.UserFilterFields;

						Object.assign(qs, sortUi?.sortDetails);

						Object.assign(qs, rest);

						qs.query ||= ''; // otherwise triggers 500

						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						const limit = returnAll ? 0 : this.getNodeParameter('limit', i) as number;

						responseData = await sufficitApiRequestAllItems.call(this, 'GET', '/contact', {}, qs, limit).then(responseData => {
								return responseData.map(user => {
								const { preferences, ...rest } = user;
								return rest;
							});
						});

					} 
				} 

				if (Array.isArray(responseData)) {
					returnData.push.apply(returnData, responseData as IDataObject[]);
				} else if (responseData !== undefined) {
					returnData.push(responseData as IDataObject);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: error.message });
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}

	methods = {
		credentialTest: {
			async sufficitBasicAuthApiTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				const credentials = credential.data as Types.BasicAuthCredentials;
				const options = requestAccessToken(credentials!.username as string, credentials!.password as string);
				try {
					await this.helpers.request(options) as Types.IdentityTokenReponse;
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

			async sufficitTokenAuthApiTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				const credentials = credential.data as Types.TokenAuthCredentials;
				const options = requestUserInfo(credentials)
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
}
