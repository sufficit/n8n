import {
	ICredentialType,
	INodeProperties,
	IAuthenticateBearer,
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
}
