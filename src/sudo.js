import config from "./config.js";
import { database } from "./index.js";
import { util, d } from "./lib/Class/Utils.js";
import { Xitext } from "./lib/Class/Xitext.js";
import { data, SERVISE } from "./lib/SERVISE.js";

/**
 *
 * @param {FullContext} ctx
 * @param {*} Dta
 */
export function sudo(ctx, _args, Dta) {
  const a = "help, ctx, global, db, data, cdata, Xitext, format, r, d, ks, rr",
    func = `(async () => {${ctx.message.text
      .replace(config.command.clearCommand, "")
      .replace(/\n/g, " ")}})();`;
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
