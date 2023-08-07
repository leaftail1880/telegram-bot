type Context = import("telegraf").Context;
type DataContext = Context & { data: State };
type State = {
	user?: DB.User;
	group?: DB.Group;
	scene?: {
		name: string;
		state: string;
	};
};

type TextMessageContext = Context & {
	message: import("telegraf/types").Message.TextMessage;
};

declare namespace CommandTypes {
	type Callback = (
		ctx: TextMessageContext & { data: State },
		input: string,
		data: State & { user_rigths: import("telegraf/types").ChatMember },
		self: Stored
	) => void;

	type Target = "group" | "private" | "all" | "channel";
	type Permission = "all" | "group_admins" | "bot_owner";

	type RegistrationInfo = {
		prefix?: true | string | string[];
		name: string;
		description: string;
		aliases?: string[];
		allowScene?: true;
		hideFromHelpList?: boolean;
		permission?: Permission;
		target?: Target;
	};

	type Stored = {
		info: RegistrationInfo & { prefix: string[] };
		callback: Callback;
	};
}

declare namespace DB {
	type User = {
		static: {
			id: number;
			nickname: string;
			name: string;
		};
		cache: {
			nickname?: string;
			dm?: 1 | 0 | undefined;
			scene?: string;
			sceneCache?: Array<string> | Record<string, any>;
		};
		needSafe?: true;
	};

	type Group = {
		static: {
			id: number;
			title: string;
		};
		cache: {
			members: Array<number>;
			silentMembers: Record<string, string>;
			lastCall?: number;
			pin?: {
				date?: number;
				message_id?: number;
				lastPins?: Record<number, number>;
			};
			workGroup?: 1;
		};
	};

	type Character = {
		name: string;
		description: string;
		fileid: string;
		path?: string;
		filepath?: string;
	};
}

type QueryCallback = (
	ctx: Context & {
		callbackQuery: import("telegraf/types").CallbackQuery.DataQuery;
	},
	path: string[],
	edit: (
		text: string,
		extra?: import("telegraf/types").Convenience.ExtraEditMessageText
	) => Promise<any>
) => void;

type ServiceData = typeof import("./index.js").Service;

type IOnErrorActions = {
	timer: import("./lib/utils/cooldown.js").Cooldown;
	codes: Record<string | number, (err?: IhandledError) => void>;
	types: Record<string, (err: IhandledError) => void>;
};

type IhandledError = {
	stack?: string;
	name: string;
	message: string;
	response?: Record<string, any> & { description: string; error_code?: number };
	on?: any;
	code?: string;
	errno?: string;
};

declare namespace NodeJS {
	interface ProcessEnv {
		TOKEN?: string;
		DB_TOKEN?: string;
		DB_REPO?: string;
		E?: string;
		whereImRunning?: string;
		dev?: string;
		ownerID?: string;
		logID?: string;
	}

	interface Process {
		on(event: CustomEvents, listener: () => void): this;
		off(event: CustomEvents, listener: () => void): this;
		emit(event: CustomEvents): this;
	}
}

type CustomEvents = "newMember" | "modulesLoad";

type seconds = number;
type milliseconds = number;
type minutes = number;
type hours = number;

type StringLike = number | string;
type Text = string | import("telegraf").Format.FmtString;
