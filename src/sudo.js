import config from "./config.js";
import { database } from "./index.js";
import { d, util } from "./lib/Class/Utils.js";
import { Xitext } from "./lib/Class/Xitext.js";
import { data, SERVISE } from "./lib/SERVISE.js";

/**
 *
 * @param {TextMessageContext} ctx
 * @param {*} Dta
 */
export function sudo(ctx, _args, Dta) {
	const a = "help, ctx, global, db, data, cdata, Xitext, format, r, d, keys, rr",
		func = `(async () => {\n${ctx.message.text.replace(config.command.clearCommand, "")}\n})();`;
	try {
		new Function(a, func)(
			a,
			ctx,
			global,
			database,
			data,
			Dta,
			Xitext,
			util,
			(m) => util.sendSeparatedMessage(util.toStr(m), (r) => ctx.reply(r)),
			d,
			(o) => Object.keys(o),
			ctx.reply.bind(ctx)
		);
	} catch (error) {
		SERVISE.error(error);
	}
}
