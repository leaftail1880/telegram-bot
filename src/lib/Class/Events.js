import clc from "cli-color";
import config from "../../config.js";
import { bot } from "../launch/tg.js";
import { data as $data } from "../SERVISE.js";

/**
 * @type {Record<string, Array<InternalEvent.Stored>>}
 */
const EVENTS = {};

/** @type {InternalEvent.Creator} */
export function InternalListener(type, position, callback) {
	const TypedEvents = EVENTS[type] || (EVENTS[type] = []);
	const InternalEvent = {
		position,
		callback,
	};
	TypedEvents.push(InternalEvent);
	EVENTS[type] = TypedEvents.sort((a, b) => b.position - a.position);
}

/** @type {InternalEvent.Trigger} */
export function TriggerInternalListeners(type, context) {
	if (EVENTS[type])
		for (const { callback } of EVENTS[type]) {
			callback({}, () => void 0, context);
		}
}

bot.on("message", async (ctx) => {
	if (ctx.from.is_bot) {
		if (ctx.from.id !== ctx.botInfo.id) return;
		if (!("text" in ctx.message)) return;
		if (!ctx.message.text.includes("--emit")) return;
	}

	const start = performance.now();
	const Executors = EVENTS.message?.length > 0 ? EVENTS.message : [];
	if ("text" in ctx.message && EVENTS.text) Executors.push(...EVENTS.text);
	if ("document" in ctx.message && EVENTS.document) Executors.push(...EVENTS.document);

	/** @type {InternalEvent.Data} */
	const data = {
		user: {
			static: {
				id: ctx.from.id,
				name: ctx.from.first_name,
				nickname: ctx.from.username,
			},
			cache: {},
		},
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
