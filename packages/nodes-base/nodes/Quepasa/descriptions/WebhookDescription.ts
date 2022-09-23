import {
	INodeProperties,
} from 'n8n-workflow';

export const webhookDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'webhook',
				],
			},
		},
		options: [
			{
				name: 'Find',
				value: 'find',
				description: 'Get a single webhook',
			},
			{
				name: 'Setup',
				value: 'setup',
				description: 'Setup a new webhook',
			},
			{
				name: 'Remove',
				value: 'remove',
				description: 'Remove a url from the list',
			},
			{
				name: 'Clear',
				value: 'clear',
				description: 'Remove all webhooks from the list',
			},
		],
		default: 'find',
	},
];

export const webhookFields: INodeProperties[] = [
	{
		displayName: 'Url',
		name: 'url',
		type: 'string',
		displayOptions: {
			show: {
				resource: [
					'webhook',
				],
				operation: [
					'setup', 'remove',
				],
			},
		},
		default: false,
		description: 'Url to trigger events',
	},
	{
		displayName: 'Forward Internal',
		name: 'forwardInternal',
		type: 'boolean',
		default: true,
		required: false,
		description: '(Optional) Forward Internal',
		displayOptions: {
			show: {
				resource: [
					'webhook',
				],
				operation: [
					'setup'
				],
			},
		},
	},
	{
		displayName: 'Track Id',
		name: 'trackId',
		type: 'string',
		default: '',
		required: false,
		description: '(Optional) System identifier, avoid duplicated messages',
		displayOptions: {
			show: {
				resource: [
					'webhook',
				],
				operation: [
					'setup'
				],
			},
		},
	},
];
