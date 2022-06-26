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

export class SufficitEndPointsTokenRequest implements ICredentialType {
	name = 'sufficitEndPointsTokenRequest';
	displayName = 'Sufficit EndPoints Token Request';
	documentationUrl = 'sufficit';
	properties: INodeProperties[] = [
		{
			displayName: 'User',
			name: 'user',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			default: '',
		},
	];
	async authenticate(credentials: ICredentialDataDecryptedObject, requestOptions: IHttpRequestOptions): Promise<IHttpRequestOptions> {
		requestOptions.auth = {
			username: identityClient as string,
		};
		return requestOptions;
	}
	test: ICredentialTestRequest = {
		request: {
			baseURL: identityBaseUrl as string,
			url: identityTokenEndPoint as string,
			body: {
				grant_type: "password",
				username: "{{$credentials.user}}",
				password: "{{$credentials.password}}",
				scope: "directives",
			}
		},
	};
}
