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
	contactFields,
	contactOperations
} from './ContactDescription';

import {
	groupDescription,
	organizationDescription,
	ticketDescription,
	userDescription,
} from './descriptions';

import {
	OptionsWithUri,
} from 'request';

import type { Sufficit as SufficitTypes } from './types';

const Identity = {
	baseUrl: 'https://identity.sufficit.com.br',
	tokenEndpoint: '/connect/token',
	userInfoEndpoint: '/connect/userinfo',
	clientName: 'SufficitEndPoints',
}

export class Sufficit implements INodeType {
	description: INodeTypeDescription = {
			displayName: 'Sufficit',
			name: 'sufficit',
			icon: 'file:sufficit.png',
			group: ['transform'],
			version: 1,
			subtitle: '={{$parameter["operation"] + ":" + $parameter["resource"]}}',
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
				...contactOperations,
				...contactFields,

				...groupDescription,
				...organizationDescription,
				...ticketDescription,
				...userDescription,
			],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
			return [[]];
	}

	methods = {
		credentialTest: {
			async sufficitBasicAuthApiTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				const credentials = credential.data as SufficitTypes.BasicAuthCredentials;

				const options: OptionsWithUri = {
					auth:{
						user: Identity.clientName,
						pass: '',
					},
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					method: 'POST',
					form: {
						grant_type: 'password',
						username: credentials.username,
						password: credentials.password,
						scope: 'directives',
					},
					uri: `${Identity.baseUrl}${Identity.tokenEndpoint}`,
					json: true,
				};

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

			async sufficitTokenAuthApiTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				const credentials = credential.data as SufficitTypes.TokenAuthCredentials;

				const options: OptionsWithUri = {
					method: 'GET',
					uri: `${Identity.baseUrl}${Identity.userInfoEndpoint}`,
					json: true,
					headers: {
						Authorization: `Bearer ${credentials.accessToken}`,
					},
				};

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
