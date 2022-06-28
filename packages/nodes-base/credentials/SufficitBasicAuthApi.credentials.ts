import {
	ICredentialType,
	ICredentialTestRequest,
	ICredentialDataDecryptedObject,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

import {
	requestAccessTokenWUrl,
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
			return requestAccessTokenWUrl(credentials!.username as string, credentials!.password as string);
		}

		requestOptions.headers = { 'Authorization': `Bearer ${credentials.accessToken}` };
		return requestOptions;
	}
}
