import { Context } from "telegraf";
import { Command } from "../../lib/class/cmdCLS.js";
import { format, d } from "../../lib/class/formatterCLS.js";
import { Xitext } from "../../lib/class/XitextCLS.js";
import { getUser } from "../../lib/functions/getUserFNC.js";
import { data, SERVISE } from "../../lib/start-stop.js";
import config from "../../config.js";
const { commandClearRegExp } = config;
import { database } from "../../index.js";
import { lang } from "../OC/index.js";

/**================================================================================================
 *                                           КОМАНДЫ
 *  Все самые основные команды бота
 *
 *
 *
 *================================================================================================**/
/*

new cmd({
  name: '',
  specprefix: true,
  description: 'Описание',
  permisson: 1,
  hide: true,
  type: 'all'
}, (ctx, args) => {
  
})
*/

/**
 *
 * @param {FullContext} ctx
 * @param {*} Dta
 */
function sudo(ctx, _args, Dta) {
  const a = "help, ctx, global, db, data, cdata, Xitext, format, r, d, ks, rr",
    func = `(async () => {${ctx.message.text
      .replace(commandClearRegExp, "")
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
new Command(
  {
    name: "f",
    aliases: ["sudo"],
    specprefix: true,
    description: "Дл",
    permisson: 2,
    hide: true,
    type: "all",
  },
  sudo
);

new Command(
  {
    name: "db",
    hide: true,
    description: "Описание",
    permisson: 2,
  },
  async (ctx, args) => {
    switch (args[0]) {
      case "pairs":
        const a = await database.getPairs();
        console.log(a);
        format.sendSeparatedMessage(format.stringifyEx(a, " "), ctx.reply);
        break;
      case "get":
        if (!args[1]) return ctx.reply("Нужно указать ключ (-db get <key>)");
        const get = await database.get(args[1], true);
        console.log(get);
        format.sendSeparatedMessage(format.stringifyEx(get, " "), (msg) =>
          ctx.reply(...new Xitext().Code(msg)._Build())
        );
        break;
      case "del":
        if (!args[1]) return ctx.reply("Нужно указать ключ (-db del <key>)");
        const del = (await database.del(args[1])) + "";
        console.log(del);
        ctx.reply(del);
        break;
      case "keys":
        const keys = await database.keys(),
          text = new Xitext().Text("Ключи:");
        keys.sort().forEach((e) => {
          text.Text("\n");
          text.Mono(e);
        });
        console.log(keys.sort());
        ctx.reply(...text._Build());
        break;
      case "set":
        if (!args[1] || !args[2])
          return ctx.reply(
            "Нужно указать ключ и значение (-db set <key> <value>)"
          );
        const set = await database.set(args[1], args[2], true);
        console.log(set);
        ctx.reply("Успешно!");
        break;
      case "help":
      default:
        ctx.reply(
          ...new Xitext()
            .Text("Доступные методы:")
            .Mono("\n pairs")
            .Mono("\n get")
            .Text(" <key>")
            .Mono("\n set")
            .Text(" <key> <value>")
            .Mono("\n del")
            .Text(" <key>")
            .Mono("\n keys")
            ._Build()
        );
    }
  }
);

new Command(
  {
    name: "stop",
    specprefix: true,
    hide: true,
    description: "Bot App",
    permisson: 2,
  },
  (_a, args) => {
    SERVISE.stop("Ручная остановка", null, args[0] ?? false, args[1] ?? false);
  }
);

new Command(
  {
    name: "log",
    hide: true,
    description: "Описание",
    permisson: 2,
    specprefix: true,
  },
  async (ctx, args) => {
    switch (args[0]) {
      case "average":
        const a = await database.logGetAverageOperationsTime();
        console.log(a);
        ctx.reply(
          `Cредняя скорость ответа сервера для методов:\n${Object.keys(a)
            .map((e) => ` ${e}: ${a[e]}`)
            .join("\n")}`
        );
        break;
      case "save":
        database.logSave();
        ctx.reply(
          "Успешно сохранено в кэше " + database.log.length + " строчек лога."
        );
        break;
      case "log":
        const log = database.logFormat().join("\n");
        console.log(log);
        ctx.reply(log);
        break;
      default:
        ctx.reply("Доступные методы:\n average\n save\n log");
        break;
    }
  }
);

new Command(
  {
    name: "ник",
    hide: true,
    description: "Задает ник при сборе",
    permisson: 0,
    type: "all",
    specprefix: true,
  },
  async (ctx, args) => {
    const user = (await getUser(ctx, false)).user,
      name = user.cache.nickname;
    if (!args[0])
      return ctx.reply(name ?? "Пустой", {
        reply_to_message_id: ctx.message.message_id,
      });
    if (!args[0] || args[0].length >= 12)
      return ctx.reply(lang.maxLength("Имя", "12-ти")[0], {
        reply_to_message_id: ctx.message.message_id,
        entities: lang.maxLength("Имя", "12-ти")[1].entities,
      });
    ctx.reply(`Ник '${name ?? "Пустой"}' сменен на '${args.join(" ")}'`, {
      reply_to_message_id: ctx.message.message_id,
      allow_sending_without_reply: true,
    });
    user.cache.nickname = args.join(" ");
    database.set("User::" + ctx.message.from.id, user, true);
  }
);
