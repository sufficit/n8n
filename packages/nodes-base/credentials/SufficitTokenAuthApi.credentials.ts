import {
	ICredentialType,
	INodeProperties,
	IAuthenticateBearer,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class SufficitTokenAuthApi implements ICredentialType {
	name = 'sufficitTokenAuthApi';
	displayName = 'Sufficit Bearer Access Token';
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

	authenticate = {
		type: 'bearer',
		properties: {},
	} as IAuthenticateBearer;

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
