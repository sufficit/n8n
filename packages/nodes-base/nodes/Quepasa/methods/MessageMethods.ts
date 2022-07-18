import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ICredentialsDecrypted,
	ICredentialTestFunctions,
	ILoadOptionsFunctions,
	INodeCredentialTestResult,
	NodeOperationError,
} from 'n8n-workflow';

import {
	messageDescription, messageFields,
	webhookDescription, webhookFields,
} from '../descriptions';

import {
	apiRequest,
	requestBotInfo,
} from '../GenericFunctions';

import type { Quepasa } from '../types';

export async function resourceMessage(this: IExecuteFunctions, operation: string, items: any, i: number): Promise<any> {
	let responseData;
	if (operation === 'download') {
		const qs: IDataObject = {};
		const objectId = this.getNodeParameter('messageId', i) as string;
		qs.id = objectId;
		responseData = await apiRequest.call(this, 'GET', '/download', {}, qs);

		const newItem: INodeExecutionData = {
			json: items[i].json,
			binary: {},
		};

		if (items[i].binary !== undefined) {
			// Create a shallow copy of the binary data so that the old
			// data references which do not get changed still stay behind
			// but the incoming data does not get changed.
			Object.assign(newItem.binary, items[i].binary);
		}

		items[i] = newItem;

		const fileName = this.getNodeParameter('fileName', i) as string;		
		const binaryData = await this.helpers.prepareBinaryData(responseData.data, fileName || "unknownFileName");
		
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
		items[i].binary![binaryPropertyName] = binaryData;
	} 
	else if (operation === 'send'){
		const method = this.getNodeParameter('method', i) as string;
		const Recipient = this.getNodeParameter('recipient', i) as string;
		const TrackId = this.getNodeParameter('trackId', i) as string;

		const headers: IDataObject = {
			'X-QUEPASA-TRACKID': TrackId
		};

		if (method === 'sendtext') {					
			const Message = this.getNodeParameter('text', i) as string;	
			let body: Quepasa.SendTextRequest = {
				message: Message,
				recipient: Recipient,
			};
			responseData = await apiRequest.call(this, 'POST', '/sendtext', body, {}, undefined, headers);			
		} 
		else if (method === 'sendurl') {
			const Url = this.getNodeParameter('url', i) as string;
			const FileName = this.getNodeParameter('filename', i) as string;			
			const Label = this.getNodeParameter('label', i) as string;
			let body: Quepasa.SendAttachmentUrlRequest = {
				chatid: Recipient,
				url: Url,
				textlabel: Label,
				filename: FileName,
			};
			responseData = await apiRequest.call(this, 'POST', '/sendurl', body, {}, undefined, headers);	
		}	
	} 
	else if (operation === 'where') {

	} 
	else if (operation === 'find') {
		
	}
			
	return responseData;
}