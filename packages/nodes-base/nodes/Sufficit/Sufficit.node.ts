import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	contactFields,
	contactOperations
} from './ContactDescription';

import {
	OptionsWithUri,
} from 'request';

export class Sufficit implements INodeType {
	description: INodeTypeDescription = {
			displayName: 'Sufficit',
			name: 'sufficit',
			icon: 'file:sufficit.png',
			group: ['transform'],
			version: 1,
			subtitle: '={{$parameter["operation"] + ":" + $parameter["resource"]}}',
			description: 'Consume Sufficit API',
			defaults: {
					name: 'Sufficit',
					color: '#1A82e2',
			},
			inputs: ['main'],
			outputs: ['main'],
			credentials: [
				{
					name: 'sufficitApi',
					required: false,
				},
			],
			properties: [
					// Node properties which the user gets displayed and
					// can change on the node.
					{
						displayName: 'Resource',
						name: 'resource',
						type: 'options',
						noDataExpression: true,
						options: [
							{
								name: 'Contact',
								value: 'contact',
							},
						],
						default: 'contact',
						required: true,
					},
					...contactOperations,
					...contactFields,
			],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
			return [[]];
	}
}
