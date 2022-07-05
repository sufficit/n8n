import {
	IHookFunctions,
	IExecuteFunctions,
	IExecuteSingleFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import {
	OptionsWithUri,
} from 'request';

import {
	IDataObject,
	NodeApiError,
	NodeOperationError,
	ICredentialType,
	ICredentialTestFunctions,
	IHttpRequestOptions,
} from 'n8n-workflow';

import {
	get,
} from 'lodash';

// used from webhook authorization, avoid bots
import { Response } from 'express';

export async function quepasaApiRequest(this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions, method: string, endpoint: string, body: any = {}, qs: IDataObject = {}, uri?: string, headers: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
	const credentials = await this.getCredentials('quepasaTokenAuthApi');

	let fullUri = credentials.baseUrl;
	if(endpoint == '/webhook'){
		fullUri = fullUri + `/v2/bot/${credentials.accessToken}/webhook`;
	} else {
		fullUri = fullUri + `/v3/bot/${credentials.accessToken}`;
	}

	const options: OptionsWithUri = {
		headers: {
			'Content-Type': 'application/json',
		},
		method,
		body,
		qs,
		uri: uri || fullUri,
		json: true,
	};

	try {	

		if (Object.keys(body).length === 0) {
			delete options.body;
		}

		qs = qs || {};

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

export function authorizationError(resp: Response, realm: string, responseCode: number, message?: string) {
	if (message === undefined) {
		message = 'Authorization problem!';
		if (responseCode === 401) {
			message = 'Authorization is required!';
		} else if (responseCode === 403) {
			message = 'Authorization data is wrong!';
		}
	}

	resp.writeHead(responseCode, { 'WWW-Authenticate': `Basic realm="${realm}"` });
	resp.end(message);
	return {
		noWebhookResponse: true,
	};
}