
export function valueNotNull(value: string | undefined): value is string {
	return value !== null;
}

export type StringOrNull = string | undefined;

export type AlertDetails = {
	messageBody: string;
	messageSubject: string;
	
};

