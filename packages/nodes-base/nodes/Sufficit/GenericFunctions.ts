import {
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

import type { Sufficit } from './types';
import { options } from '../KoBoToolbox/Options';

export const Identity = {
	baseUrl: 'https://identity.sufficit.com.br',
	tokenEndpoint: '/connect/token',
	userInfoEndpoint: '/connect/userinfo',
	clientName: 'SufficitEndPoints',
};

export const AccessTokenUrl = `${Identity.baseUrl}${Identity.tokenEndpoint}`;

export const EndPointsAPI ={
	baseUrl: 'https://endpoints.sufficit.com.br',
}

export async function sufficitApiRequest(this: IExecuteFunctions | ILoadOptionsFunctions, method: string, endpoint: string, body: any = {}, qs: IDataObject = {}, uri?: string, headers: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
	const options: OptionsWithUri = {
		headers: {
			'Content-Type': 'application/json',
		},
		method,
		body,
		qs,
		uri: uri || `${EndPointsAPI.baseUrl}${endpoint}`,
		json: true,
	};

	try {

		if (Object.keys(body).length === 0) {
			delete options.body;
		}

		// checking if that endpoint should be authorized
		if(isAuthorizedEndPoint(endpoint)){
			const access_token = await getAccessToken.call(this);
			options.headers!.Authorization = `Bearer ${access_token}`;
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

export async function sufficitApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	resource: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	limit = 0,
) {
	const returnData: IDataObject[] = [];

	let responseData;
	qs.per_page = 20;
	qs.page = 1;

	do {
		responseData = await sufficitApiRequest.call(this, method, resource, body, qs);
		returnData.push(...responseData);

		if (limit && returnData.length > limit) {
			return returnData.slice(0, limit);
		}

		qs.page++;
	} while (responseData.length);

	return returnData;
}

export function isAuthorizedEndPoint(ep: string): boolean {
	switch(ep){
		case "/contact": return false;
		default: return true;
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

export function requestUserInfo(credentials: Sufficit.Credentials){
	const options: OptionsWithUri = {
		method: 'GET',
		uri: `${Identity.baseUrl}${Identity.userInfoEndpoint}`,
		json: true,
		headers: {
			Authorization: `Bearer ${credentials.accessToken}`,
		},
	};
	return options;
}

async function getAccessToken(this: ILoadOptionsFunctions | IExecuteFunctions | IExecuteSingleFunctions): Promise<string> {
	const authentication = this.getNodeParameter('authentication', 0) as 'basicAuth' | 'tokenAuth';
	if (authentication === 'basicAuth') {
		const credentials = await this.getCredentials('sufficitBasicAuthApi') as Sufficit.BasicAuthCredentials;
		if(!credentials) return "";
		const options = requestAccessToken(credentials!.username as string, credentials!.password as string);
		//if (!options || !this || !this.helpers || !this.helpers.request) return "";
		const response = await this.helpers.request!(options);
		return response.access_token;
	} else {
		const credentials = await this.getCredentials('sufficitTokenAuthApi') as Sufficit.TokenAuthCredentials;
		return credentials.accessToken;
	}
}

export function requestAccessToken(username: string, password: string){
	return {
		auth:{
			username: Identity.clientName as string,
			password: '' as string,
		},
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		method: 'POST',
		form: {
			grant_type: 'password',
			username: username as string,
			password: password as string,
			scope: 'openid directives',
		},
		uri: AccessTokenUrl,
		json: true,
	} as OptionsWithUri;
}


export function requestInfo(username: string, password: string){
	return {
		headers: {
			'Authorization': 'Basic ' + Buffer.from(Identity.clientName + ":").toString('base64'),
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		method: 'POST',
		body: new URLSearchParams({
			'grant_type': 'password',
			'username': username as string,
			'password': password as string,
			'scope': 'openid directives',
		}),
		json: true,
	};
}
