export type InternalCreator = <T extends keyof InternalContext>(
	type: T,
	position: number,
	callback: (ctx: InternalContext[T], next: () => void, data: InternalEvent.Data, extraData?: Object) => any
) => void;

export type InternalTrigger = <T extends keyof InternalContext>(type: T, context?: InternalContext[T]) => void;

interface InternalContext {
	message: Context & import("telegraf/types").Message;
	text: Context & { message: import("telegraf/types").Message.TextMessage };
	document: Context & { document: import("telegraf/types").Message.DocumentMessage };
	"modules.load": any;
	"new.release": any;
	"new.member": any;
}
export type InernalStore = Record<
	string,
	{
		position: number;
		callback: Function;
	}
>;
