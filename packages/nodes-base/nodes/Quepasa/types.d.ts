import {
	IDataObject,
} from 'n8n-workflow';

export declare namespace Quepasa {

	export type Resource = 'message' | 'webhook';

	export type PathCredentials = {
		baseUrl: string;
		accessToken: string;
	}

	export type UserAdditionalFields = IDataObject & Quepasa.CustomFieldsUi & Quepasa.AddressUi;
	export type UserUpdateFields = UserAdditionalFields;
	export type UserFilterFields = IDataObject & Quepasa.SortUi;

	export type Organization = {
		active: boolean;
		id: number;
		name: string;
	};

	export type Group = Organization;

	export type GroupUpdateFields = UserUpdateFields;

	export type User = {
		id: number;
		login: string;
		lastname: string;
		email: string;
		role_ids: number[];
	};

	export type Field = {
		id: number,
		display: string;
		name: string;
		object: string;
		created_by_id: number;
	};

	export type UserField = {
		display: string;
		name: string;
	};

	export type CustomFieldsUi = {
		customFieldsUi?: {
			customFieldPairs: Array<{ name: string, value: string }>;
		};
	};

	export type SortUi = {
		sortUi?: {
			sortDetails: {
				sort_by: string;
				order_by: string;
			};
		};
	};

	export type AddressUi = {
		addressUi?: {
			addressDetails: {
				city: string;
				country: string;
				street: string;
				zip: string;
			};
		};
	};

	export type Article = {
		articleDetails: {
			visibility: 'external' | 'internal',
			subject: string,
			body: string,
			type: 'chat' | 'email' | 'fax' | 'note' | 'phone' | 'sms',
		};
	};
}
