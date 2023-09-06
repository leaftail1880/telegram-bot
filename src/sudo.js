import config from "./config.js";
import { Service, bot, database, tables } from "./index.js";
import { u, util } from "./lib/utils/index.js";

/**
 *
 * @param {TextMessageContext} ctx
 * @param {unknown} _
 * @param {unknown} data
 */
export async function sudo(ctx, _, data) {
	const args = "help, ctx, Service, data, util, r, d, keys, rr, bot, tables, database";
	const code = `(async () => {\n${ctx.message.text.replace(
		config.command.clear,
		""
	)}\n})();`;
	try {
		const func = new Function(args, code);
		await func(
			args, //help
			ctx,
			Service, // bot data
			data, // event data
			util,
			(/** @type {unknown} */ m) =>
				util.sendSeparatedMessage(util.inspect(m), (r) => ctx.reply(r)),
			u,
			(/** @type {unknown} */ o) => Object.keys(o), //keys
			ctx.reply.bind(ctx), //rr
			bot,
			tables, // tb,
			database
		);
	} catch (error) {
		Service.error(error);
	}
}