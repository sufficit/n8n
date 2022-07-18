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
			{
				name: 'Send',
				value: 'send',
				description: 'Send a message',
			},
		],
		default: 'send',
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
	{
		displayName: 'File Name',
		name: 'fileName',
		type: 'string',
		default: '',
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
		placeholder: 'downloaded.pdf',
		description: '(Optional) File name to be outputed if setted',
	},
	
	// --------------------------------------------------------------------------
	// message:send -> operation:send
	// --------------------------------------------------------------------------	
	{
		displayName: 'Method',
		name: 'method',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'send',
				],
			},
		},
		options: [
			{
				name: 'Send Text',
				value: 'sendtext',
			},
			{
				name: 'Send Attachment By Url',
				value: 'sendurl',
			},
			{
				name: 'Send Attachment Binary',
				value: 'sendbinary',
			},
			{
				name: 'Send Attachment Base64',
				value: 'sendencoded',
			},
		],
		default: 'sendtext',
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'send'
				],
				method:[
					'sendtext'
				],
			},
		},
		default: '',
		description: 'Text message',
	},	
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'send'
				],
				method:[
					'sendurl', 'sendbinary', 'sendencoded'
				],
			},
		},
		default: '',
		description: 'Label for images',
	},
	{
		displayName: 'Chat Id',
		name: 'recipient',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'send'
				],
			},
		},
		default: '',
		description: 'Destination conversation, ChatId Group or any E164 Phone Number',
	},
	{
		displayName: 'Url',
		name: 'url',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'send'
				],
				method: [
					'sendurl'
				],
			},
		},
		default: '',
		description: 'Url path to append attachment',
	},
	{
		displayName: 'File Name',
		name: 'filename',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'send'
				],
				method: [
					'sendurl', 'sendbinary', 'sendencoded'
				],
			},
		},
		default: '',
		description: 'File name and extension, auto-generated',
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
					'message',
				],
				operation: [
					'send'
				],
			},
		},
	},
];