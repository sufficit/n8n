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

import type { Quepasa } from './types';

// used from webhook authorization, avoid bots
import { Response } from 'express';

export async function apiRequest(this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions, method: string, endpoint: string, body: any = {}, qs: IDataObject = {}, uri?: string, headers: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
	const credentials = await this.getCredentials('quepasaTokenAuthApi');

	let fullUri = credentials.baseUrl;
	fullUri = fullUri + `/v3/bot/${credentials.accessToken}${endpoint}`;	

	const options: OptionsWithUri = {
		headers: {
			Accept: 'application/json',
		},
		method,
		qs,
		uri: uri || fullUri,
	};

	if (endpoint === '/download/message') {
		options.encoding = null;
	} else {
		options.json = true;
	}

	if (Object.keys(body).length !== 0) {
		options.body = body;
	}

	qs = qs || {};

	if (options.qs && Object.keys(options.qs).length === 0) {
		delete options.qs;
	}

	try {	
		const responseData = await this.helpers.request!(options);
				
		if (endpoint === '/download/message') {
			return {
				data: responseData,
			};
		}
		
		if (responseData.success === false) {
			throw new NodeApiError(this.getNode(), responseData);
		}

		return {
			additionalData: responseData.additional_data,
			data: (responseData.data === null) ? [] : responseData.data,
		};
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

export function requestBotInfo(credentials: Quepasa.PathCredentials){
	let baseUrl = credentials.baseUrl;
	if (baseUrl.endsWith("/")){
		baseUrl = baseUrl.slice(0, -1);
	}

	const options: OptionsWithUri = {
		method: 'GET',
		uri: `${baseUrl}/v3/bot/${credentials.accessToken}`,
		json: true,
	};
	return options;
}