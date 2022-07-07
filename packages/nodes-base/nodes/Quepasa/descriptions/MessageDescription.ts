import {
	INodeProperties,
} from 'n8n-workflow';

export const messageDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'message',
				],
			},
		},
		options: [
			{
				name: 'Find',
				value: 'find',
				description: 'Get a single message',
			},
			{
				name: 'Where',
				value: 'where',
				description: 'Get all messages that match a criteria',
			},
			{
				name: 'Download',
				value: 'download',
				description: 'Download a message attachment',
			},
		],
		default: 'find',
	},
];

export const messageFields: INodeProperties[] = [
	// --------------------------------------------------------------------------
	// message:get -> operation:where
	// --------------------------------------------------------------------------	
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'where',
				],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'where',
				],
				returnAll: [
					false,
				],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 1000,
		},
		default: 10,
		description: 'Max number of results to return',
	},

	// --------------------------------------------------------------------------
	// message:get -> operation:find
	// --------------------------------------------------------------------------	
	{
		displayName: 'Message Id',
		name: 'messageId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'find', 'download'
				],
			},
		},
		default: '',
		description: 'Unique Id of the message',
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'download',
				],				
			},

		},
		placeholder: '',
		description: 'Name of the binary property which contains the data for the file to be created',
	},
];