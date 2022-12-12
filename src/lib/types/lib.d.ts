type Context = import("telegraf").Context;

type TextMessageContext = Context & { message: import("telegraf/types").Message.TextMessage };

namespace CommandTypes {
	type Stored = {
		info: {
			name: string;
			description: string;
			type: CommandTypes.Target;
			perm: number;
			hide: boolean;
			session: string;
			aliases: Array<string>;
		};
		callback: CommandTypes.Callback;
	};

	type Callback = (
		ctx: TextMessageContext,
		args: Array<string>,
		data: InternalEvent.Data,
		self: CommandTypes.Stored
	) => void;

	type Target = "group" | "private" | "all" | "channel";

	type RegistrationInfo = {
		name: string;
		aliases?: Array<string>;
		hide?: boolean;
		specprefix?: boolean;
		description?: string;
		session?: string;
		permisson?: 0 | 1 | 2;
		type?: CommandTypes.Target;
	};
}

namespace InternalEvent {
	type Stored = {
		position: number;
		callback: Function;
	};
	type Data = {
		user: DB.User;
		group?: DB.Group;
	};
	type CacheUser = {
		time: number;
		data: InternalEvent.Data;
	};
	type Creator = <T extends keyof InternalEvent.Events>(
		type: T,
		position: number,
		callback: (ctx: InternalEvent.Events[T], next: () => void, data: InternalEvent.Data, extraData?: Object) => any
	) => void;

	type Trigger = <T extends keyof InternalEvent.Events>(type: T, context?: InternalEvent.Events[T]) => void;

	interface Events {
		message: Context & import("telegraf/types").Message;
		text: Context & { message: import("telegraf/types").Message.TextMessage };
		document: Context & { document: import("telegraf/types").Message.DocumentMessage };
		"modules.load": any;
		"new.release": any;
		"new.member": any;
	}
	type Store = Record<
		string,
		{
			position: number;
			callback: Function;
		}
	>;
}

namespace DB {
	type User = {
		static: {
			id: number;
			nickname: string;
			name: string;
		};
		cache: {
			nickname?: string;
			dm?: 1 | 0 | undefined;
			session?: string;
			sessionCache?: string[];
			tag?: string;
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
			titleAnimation?: Array<string>;
			titleAnimationSpeed?: number;
			lastCall?: number;
			lastPin?: {};
			pin?: string;
		};
	};
}

namespace IQueryTypes {
	type Callback = (
		ctx: Context,
		path: string[],
		edit: (text: string, extra?: import("telegraf/types").Convenience.ExtraReplyMessage) => Promise<void>
	) => void;
}

type ISessionData = typeof import("../SERVISE.js").data;

type EXTENDS<EX, Value extends EX> = Value;

type IOnErrorActions = {
	timer: import("../Class/XTimer.js").XTimer;
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

type IEnv = {
	TOKEN?: string;
	REDIS_URL?: string;
	whereImRunning?: string;
	dev?: string | boolean;
	ownerID?: string;
	logID?: string;
};

type seconds = number;
type milliseconds = number;
