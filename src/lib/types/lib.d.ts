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

	type Callback = (ctx: TextMessageContext, args: Array<string>, data: IEvent.Data, self: CommandTypes.Stored) => void;

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

namespace IEvent {
	type Stored = {
		position: number;
		callback: Function;
	};
	type Data = {
		user: DB.User;
		session?: {
			name: string;
			int_state: number;
			state: string;
		};
		group?: DB.Group;
		user_rigths?: import("telegraf/types").ChatMember;
	};
	type CacheUser = {
		time: number;
		data: IEvent.Data;
	};
	type Creator = <T extends keyof IEvent.Events>(
		type: T,
		position: number,
		callback: (ctx: IEvent.Events[T], next: () => void, data: IEvent.Data, extraData?: Object) => any
	) => void;

	type Trigger = <T extends keyof IEvent.Events>(type: T, context?: IEvent.Events[T]) => void;

	interface Events {
		message: Context & import("telegraf/types").Message;
		text: Context & { message: import("telegraf/types").Message.TextMessage };
		document: Context & { message: import("telegraf/types").Message.DocumentMessage };
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

type CustomEmitter<events extends Record<string | symbol, any>> = {
	on<N extends keyof events>(eventName: N, listener: (arg: events[N]) => void): import("events").EventEmitter;
	emit<N extends keyof events>(eventName: N, arg: events[N]): boolean;
};

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
			sessionCache?: string[] | Record<string, any>;
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
			artRepost?: 1 | undefined;
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
	VK_TOKEN?: string;
	whereImRunning?: string;
	dev?: string | boolean;
	ownerID?: string;
	logID?: string;
};

type seconds = number;
type milliseconds = number;

declare module "hooman" {
	const got: import("got").Got;
	export default got;
}
