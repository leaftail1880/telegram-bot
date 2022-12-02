export type IOnErrorActions = {
	cache: {
		lastTime: number;
		type: string;
		cooldown: number;
	};
	codes: Record<string | number, (err?: IhandledError) => void>;
	types: Record<string, (err: IhandledError) => void>;
};

export type IhandledError = {
	stack: string;
	name: string;
	message: string;
	response?: Record<string, any> & { description: string; error_code?: number };
	on?: any;
};
