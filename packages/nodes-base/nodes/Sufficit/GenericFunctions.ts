import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import {
	OptionsWithUri,
} from 'request';

import {
	IDataObject, NodeApiError, NodeOperationError,
	ICredentialType,
} from 'n8n-workflow';

import {
	get,
} from 'lodash';

import moment from 'moment-timezone';

import jwt from 'jsonwebtoken';

export async function sufficitApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: object,
	query?: IDataObject
): Promise<any> {

	const options: OptionsWithUri = {
		headers: {
			'Content-Type': 'application/json',
		},
		method,
		body,
		uri: `https://endpoints.sufficit.com.br/${endpoint}`,
		json: true,
	};

	try {

		if (Object.keys(body).length === 0) {
			delete options.body;
		}

		const { access_token } = await getAccessToken.call(this);
		options.headers!.Authorization = `Bearer ${access_token}`;

		query = query || {};


		if (options.qs && Object.keys(options.qs).length === 0) {
			delete options.qs;
		}

		return await this.helpers.request!(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export function eventExists(currentEvents: string[], webhookEvents: IDataObject) {
	for (const currentEvent of currentEvents) {
		if (get(webhookEvents, `${currentEvent.split('.')[0]}.${currentEvent.split('.')[1]}`) !== true) {
			return false;
		}
	}
	return true;
}

export function validateJSON(json: string | undefined): any { // tslint:disable-line:no-any
	let result;
	try {
		result = JSON.parse(json!);
	} catch (exception) {
		result = undefined;
	}
	return result;
}

async function getAccessToken(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions): Promise<IDataObject> {
	const credentials = await this.getCredentials('sufficitApi');
	const options: OptionsWithUri = {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': `Basic ${Buffer.from('SufficitEndPoints', 'hex')}`,
		},
		method: 'POST',
		form: {
			grant_type: 'password',
			username: credentials.user,
			password: credentials.password,
			scope: 'directives',
		},
		uri: 'https://identity.sufficit.com.br/connect/token',
		json: true,
	};

	//@ts-ignore
	return this.helpers.request(options);
}
