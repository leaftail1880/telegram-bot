import config from "../../config.js";
import { bot, data as $data, newlog } from "../../index.js";

/**
 * @type {Record<string, Array<IEvent.Stored>>}
 */
const EVENTS = {};

/** @type {IEvent.Creator} */
export function EventListener(type, position, callback) {
	const TypedEvents = EVENTS[type] || (EVENTS[type] = []);
	const InternalEvent = {
		position,
		callback,
	};
	TypedEvents.push(InternalEvent);
	EVENTS[type] = TypedEvents.sort((a, b) => b.position - a.position);
}

/** @type {IEvent.Trigger} */
export function TriggerEventListeners(type, context) {
	if (EVENTS[type])
		for (const { callback } of EVENTS[type]) {
			callback({}, () => void 0, context);
		}
}

EventListener("modules.load", 0, () => {
	bot.on("message", async (ctx, next) => {
		if (ctx.from.is_bot) {
			if (ctx.from.id !== ctx.botInfo.id) return;
			if (!("text" in ctx.message)) return;
			if (!ctx.message.text.includes("--emit")) return;
		}

		const start = performance.now();
		const Executors = EVENTS.message?.length > 0 ? EVENTS.message : [];
		if ("text" in ctx.message && EVENTS.text) Executors.push(...EVENTS.text);
		if ("document" in ctx.message && EVENTS.document) Executors.push(...EVENTS.document);

		/** @type {IEvent.Data} */
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
			newlog({
				fileName: "updates.txt",
				fileMessage: (performance.now() - start).toFixed(2),
			});
		}
	});
});

/**
 * @template T
 * @param {T} ctx
 * @param {Array<function>} f
 * @param {IEvent.Data} data
 * @returns
 */
function execute(ctx, f, data) {
	if (!Array.isArray(f) || typeof f[0] !== "function") return;
	f[0](ctx, () => execute(ctx, f.slice(1), data), data);
}
