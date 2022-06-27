import {
	ICredentialType,
	ICredentialTestRequest,
	ICredentialDataDecryptedObject,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import {
	OptionsWithUri,
} from 'request';

import {
	requestAccessToken,
	requestUserInfo,
	sufficitApiRequest,
	sufficitApiRequestAllItems,
} from '../nodes/Sufficit/GenericFunctions';

export class SufficitBasicAuthApi implements ICredentialType {
	name = 'sufficitBasicAuthApi';
	displayName = 'Sufficit Basic Auth';
	documentationUrl = 'sufficit';
	properties: INodeProperties[] = [
		{
			displayName: 'User E-Mail',
			name: 'username',
			placeholder: 'name@email.com',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'hidden',
			default: '',
		}
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://identity.sufficit.com.br',
			url: '/connect/userinfo',
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'error',
					value: 'invalid_auth',
					message: 'Invalid access token',
				},
			},
		],
	};

	async authenticate(credentials: ICredentialDataDecryptedObject, requestOptions: IHttpRequestOptions): Promise<IHttpRequestOptions> {
		if(!credentials.accessToken){
			const options = requestAccessToken(credentials!.username as string, credentials!.password as string);
			if (options && credentials.helpers && credentials.helpers.request) {
				const response = await credentials.helpers.request(options);
				credentials.accessToken = response.access_token;
			}
		}

		requestOptions.headers = { 'Authorization': `Bearer ${credentials.accessToken}` };
		return requestOptions;
	}
}
