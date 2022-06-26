import {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

const identityClient = 'SufficitEndPoints';
const identityBaseUrl = 'https://identity.sufficit.com.br';
const identityTokenEndPoint = '/connect/token';

import jwt from 'jsonwebtoken';
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
			const token = jwt.sign({}, Buffer.from('', 'hex'), {
			keyid: identityClient,
			algorithm: 'HS256',
			expiresIn: '5m',
		});

		requestOptions.headers = {
			...requestOptions.headers,
			Authorization: `Bearer ${token}`,
		};
		return requestOptions;
	}

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://identity.sufficit.com.br',
			url: '/connect/token',
		},
	};
}
