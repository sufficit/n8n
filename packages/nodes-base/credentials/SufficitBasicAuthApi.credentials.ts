import {
	ICredentialType,
	ICredentialTestRequest,
	ICredentialDataDecryptedObject,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

import {
	AccessTokenUrl,
	requestInfo,
} from '../nodes/Sufficit/GenericFunctions';

import fetch from 'node-fetch';

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
			const options = requestInfo(credentials!.username as string, credentials!.password as string);
			const response = await fetch(AccessTokenUrl, options);

			if (!response.ok) {
				throw new Error(`Error! status: ${response.status}`);
			}

			const data = await response.json();
			console.debug(`SUFFICIT :: ${data}`);

			requestOptions.headers = { 'Authorization': `Bearer ${data.access_token}` };
		} else {
			requestOptions.headers = { 'Authorization': `Bearer ${credentials.accessToken}` };
		}

		return requestOptions;
	}
}
