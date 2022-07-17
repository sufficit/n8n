import {
	INodeProperties,
} from 'n8n-workflow';

export const publicDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'public',
				],
			},
		},
		options: [
			{
				name: 'Create Contact',
				value: 'contactCreate',
			},
			{
				name: 'Get Contact Details',
				value: 'contact',
			},
			{
				name: 'Create Conversation',
				value: 'conversation',
			},
			{
				name: 'Get All Conversation',
				value: 'conversations',
			},
			{
				name: 'Create Message',
				value: 'message',
			},
			{
				name: 'Get All Messages',
				value: 'messages',
			},
		],
		default: 'messages',
	},
	{
		displayName: 'Inbox Identifier',
		name: 'inboxIdentifier',
		type: 'string',
		displayOptions: {
			show: {
				resource: [
					'public',
				]
			},
		},
		required: true,
		default: '',
	},
	{
		displayName: 'Contact Identifier',
		name: 'contactIdentifier',
		type: 'string',
		displayOptions: {
			show: {
				resource: [
					'public',
				],
				operation:[
					'messages', 'contact'
				]
			},
		},
		required: true,
		default: '',
	},
	{
		displayName: 'Conversation Id',
		name: 'conversationId',
		type: 'string',
		displayOptions: {
			show: {
				resource: [
					'public',
				],
				operation:[
					'messages',
				]
			},
		},
		required: true,
		default: '',
	},

	// Contact Create 
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: [
					'public',
				],
				operation:[
					'contactCreate',
				]
			},
		},
		required: true,
		default: '',
	},
	{
		displayName: 'Phone number',
		name: 'phoneNumber',
		type: 'string',
		displayOptions: {
			show: {
				resource: [
					'public',
				],
				operation:[
					'contactCreate',
				]
			},
		},
		required: true,
		default: '',
	},
	{
		displayName: 'Identifier',
		name: 'identifier',
		type: 'string',
		displayOptions: {
			show: {
				resource: [
					'public',
				],
				operation:[
					'contactCreate',
				]
			},
		},
		default: '',
		description: '(Optional) External API Contact identifier, *URL Escaped - valid query parameter',
	},
];