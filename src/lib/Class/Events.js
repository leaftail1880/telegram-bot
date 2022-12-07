import clc from "cli-color";
import config from "../../config.js";
import { bot } from "../launch/tg.js";
import { data as $data } from "../SERVISE.js";

/**
 * @type {Record<string, Array<InternalEvent.Stored>>}
 */
const EVENTS = {};

/** @type {import("./EventTypes.js").InternalCreator} */
export function InternalListener(type, position, callback) {
	const TypedEvents = EVENTS[type] || (EVENTS[type] = []);
	const InternalEvent = {
		position,
		callback,
	};
	TypedEvents.push(InternalEvent);
	EVENTS[type] = TypedEvents.sort((a, b) => b.position - a.position);
}

/** @type {import("./EventTypes.js").InternalTrigger} */
export function TriggerInternalListeners(type, context) {
	if (EVENTS[type])
		for (const { callback } of EVENTS[type]) {
			callback({}, () => void 0, context);
		}
}

bot.on("message", async (ctx) => {
	if (ctx.from.is_bot) {
		if (
			ctx.from.id != ctx.botInfo.id ||
			// @ts-ignore
			!ctx.message.text ||
			// @ts-ignore
			!ctx.message.text.includes("--emit")
		)
			return;
	}

	const start = performance.now();
	const Executors = EVENTS.message?.length > 0 ? EVENTS.message : [];
	// @ts-ignore
	if (ctx.message.text && EVENTS.text) Executors.push(...EVENTS.text);
	// @ts-ignore
	if (ctx.message.document && EVENTS.document) Executors.push(...EVENTS.document);

	/** @type {InternalEvent.Data} */
	const data = {
		Euser: {
			static: {
				id: ctx.from.id,
				name: ctx.from.first_name,
				nickname: ctx.from.username,
			},
			cache: {},
		},
		user: ctx.from,
		userRights: ctx.chatMember,
	};

	execute(
		ctx,
		Executors.map((e) => e.callback),
		data
	);

	if (Date.now() - $data.start_time < config.update.logTime) {
		console.log("U:", clc.yellowBright((performance.now() - start).toFixed(2)));
	}
});

/**
 * @template T
 * @param {T} ctx
 * @param {Array<function>} f
 * @param {InternalEvent.Data} data
 * @returns
 */
function execute(ctx, f, data) {
	if (!Array.isArray(f) || typeof f[0] !== "function") return;
	f[0](ctx, () => execute(ctx, f.slice(1), data), data);
}
