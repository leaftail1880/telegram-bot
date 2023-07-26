import config from "./config.js";
import { bot, data, database, Service, tables } from "./index.js";
import { u, util } from "./lib/Class/Utils.js";

/**
 *
 * @param {TextMessageContext} ctx
 * @param {unknown} _
 * @param {unknown} Data
 */
export async function sudo(ctx, _, Data) {
	const args = "help, ctx, data, edata, util, r, d, keys, rr, bot, tb, db";
	const code = `(async () => {\n${ctx.message.text.replace(
		config.command.clear,
		""
	)}\n})();`;
	const func = new Function(args, code);
	try {
		await func(
			args, //help
			ctx,
			data, // bot data
			Data, // event data
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
