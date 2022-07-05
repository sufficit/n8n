import {
	ICredentialType,
	INodeProperties,
	IAuthenticateBearer,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class QuepasaTokenAuthApi implements ICredentialType {
	name = 'quepasaTokenAuthApi';
	displayName = 'Quepasa Access Token';
	documentationUrl = 'quepasa';
	properties: INodeProperties[] = [
		{
			displayName: 'Quepasa API Url',
			name: 'baseUrl',
			placeholder: "https://quepasa.org",
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			placeholder: "00000000-0000-0000-0000-000000000000",
			default: '',
			required: true,
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '{{$credentials?.baseUrl}}',
			url: '/v3/bot/{{$credentials?.accessToken}}',
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
