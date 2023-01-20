import config from "./config.js";
import { bot, data, database, Service, tables } from "./index.js";
import { d, util } from "./lib/Class/Utils.js";
import { Xitext } from "./lib/Class/Xitext.js";

/**
 *
 * @param {TextMessageContext} ctx
 * @param {unknown} _
 * @param {unknown} Data
 */
export async function sudo(ctx, _, Data) {
	const args = "help, ctx, db, data, edata, Xitext, util, r, d, keys, rr, bot, tb";
	const code = `(async () => {\n${ctx.message.text.replace(config.command.clear, "")}\n})();`;
	const func = new Function(args, code);
	try {
		await func(
			args, //help
			ctx,
			database, //db
			data, // bot data
			Data, // event data
			Xitext,
			util,
			(m) => util.sendSeparatedMessage(util.inspect(m), (r) => ctx.reply(r)),
			d,
			(o) => Object.keys(o), //keys
			ctx.reply.bind(ctx), //rr
			bot,
			tables // tb
		);
	} catch (error) {
		Service.error(error);
	}
}
