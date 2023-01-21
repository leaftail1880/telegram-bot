type Context = import("telegraf").Context;
type DataContext = Context & { data: State };
type State = { [K in keyof IEvent.Data]?: IEvent.Data[K] };

type TextMessageContext = Context & { message: import("telegraf/types").Message.TextMessage };

namespace CommandTypes {
	type Callback = (
		ctx: TextMessageContext,
		input: string,
		data: IEvent.Data & { user_rigths: import("telegraf/types").ChatMember },
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

namespace IEvent {
	type Stored = {
		position: number;
		callback: Function;
	};
	type Data = {
		user: DB.User;
		group?: DB.Group;
		scene?: {
			name: string;
			state: string;
		};
	};

	type Creator = <T extends keyof IEvent.Events>(
		type: T,
		position: number,
		callback: (ctx: IEvent.Events[T], next: () => void, data: IEvent.Data, extraData?: Object) => any
	) => void;

	type Trigger = <T extends keyof IEvent.Events>(type: T, context?: IEvent.Events[T]) => Promise<void>;

	interface Events {
		"modules.load": any;
		"new.member": any;
	}
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
			scene?: string;
			sceneCache?: string[] | Record<string, any>;
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

type QueryCallback = (
	ctx: Context & { callbackQuery },
	path: string[],
	edit: (text: string, extra?: import("telegraf/types").Convenience.ExtraReplyMessage) => Promise<void>
) => void;

type ServiceData = typeof import("../index.js").data;

type IOnErrorActions = {
	timer: import("../lib/Class/XTimer.js").XTimer;
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
	DB_TOKEN?: string;
	DB_REPO?: string;
	VK_TOKEN?: string;
	whereImRunning?: string;
	dev?: string | boolean;
	ownerID?: string;
	logID?: string;
};

type seconds = number;
type milliseconds = number;
type minutes = number;
type hours = number;

declare module "hooman" {
	const got: import("got").Got;
	export default got;
}

type Optional<O> = { [E in keyof O]?: O[E] };
