import config from "./config.js";
import { database } from "./index.js";
import { format, d } from "./lib/Class/Formatter.js";
import { Xitext } from "./lib/Class/Xitext.js";
import { data, SERVISE } from "./lib/start-stop.js";

/**
 *
 * @param {FullContext} ctx
 * @param {*} Dta
 */
export function sudo(ctx, _args, Dta) {
  const a = "help, ctx, global, db, data, cdata, Xitext, format, r, d, ks, rr",
    func = `(async () => {${ctx.message.text
      .replace(config.commandClearRegExp, "")
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
      format,
      (m) => format.sendSeparatedMessage(format.toStr(m), (r) => ctx.reply(r)),
      d,
      (o) => Object.keys(o),
      ctx.reply.bind(ctx)
    );
  } catch (error) {
    SERVISE.error(error);
  }
}
