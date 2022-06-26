import {
	IAuthenticateBearer,
	IAuthenticateQueryAuth,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SufficitApi implements ICredentialType {
	name = 'sufficitApi';
	displayName = 'Sufficit EndPoints API Token';
	documentationUrl = 'sufficit';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			default: '',
			required: true,
		},
	];
	authenticate: IAuthenticateBearer = {
		type: 'bearer',
		properties: {
			tokenPropertyName: 'accessToken',
		},
	};
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
}
