import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SufficitTokenAuthApi implements ICredentialType {
	name = 'sufficitTokenAuthApi';
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
}
