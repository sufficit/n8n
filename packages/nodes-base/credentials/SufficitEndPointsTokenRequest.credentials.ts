import {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

import {
	OptionsWithUri,
} from 'request';

const identityClient = 'SufficitEndPoints';
const identityBaseUrl = 'https://identity.sufficit.com.br';
const identityTokenEndPoint = '/connect/token';

export class SufficitEndPointsTokenRequest implements ICredentialType {
	name = 'sufficitApi';
	displayName = 'Sufficit EndPoints Token Request (43)';
	documentationUrl = 'sufficit';
	properties: INodeProperties[] = [
		{
			displayName: 'User E-Mail',
			name: 'user',
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
	];

	async authenticate(credentials: ICredentialDataDecryptedObject, requestOptions: IHttpRequestOptions): Promise<IHttpRequestOptions> {
		const options: OptionsWithUri = {
			auth:{
				user: 'SufficitEndPoints',
				pass: '',
			},
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			method: 'POST',
			form: {
				grant_type: 'password',
				username: credentials.user,
				password: credentials.password,
				scope: 'directives',
			},
			uri: 'https://identity.sufficit.com.br/connect/token',
			json: true,
		};

		//@ts-ignore
		const reponse = await this.helpers.request(options);

		requestOptions.headers = {
			...requestOptions.headers,
			Authorization: `Bearer ${reponse.access_token}`,
		};
		return requestOptions;
	}

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
