import { XTimer } from "../Class/XTimer.js";

export type IOnErrorActions = {
	timer: XTimer
	codes: Record<string | number, (err?: IhandledError) => void>;
	types: Record<string, (err: IhandledError) => void>;
};

export type IhandledError = {
	stack: string;
	name: string;
	message: string;
	response?: Record<string, any> & { description: string; error_code?: number };
	on?: any;
	code?: string;
	type?: string;
	errno?: string;
};
