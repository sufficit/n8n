import {
	INodeProperties,
} from 'n8n-workflow';

export const contactDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'contact',
				],
			},
		},
		options: [
			{
				name: 'Find',
				value: 'find',
				description: 'Get a single contact',
			},
			{
				name: 'Where',
				value: 'where',
				description: 'Get all contacts that match a criteria',
			},
		],
		default: 'find',
	},
];

export const contactFields: INodeProperties[] = [
	// --------------------------------------------------------------------------
	// contact:get -> operation:where
	// --------------------------------------------------------------------------	
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [
					'contact',
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
					'contact',
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
	// contact:get -> operation:find
	// --------------------------------------------------------------------------	
	{
		displayName: 'Contact Id',
		name: 'contactId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'contact',
				],
				operation: [
					'find',
				],
			},
		},
		default: '',
		description: 'Unique Id of the contact',
	},
];