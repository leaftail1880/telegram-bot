import { env } from "../../app/setup/tg.js";
import { d, format } from "../../app/class/formatterCLS.js";
import { database } from "../../index.js";
import { cmd } from "../../app/class/cmdCLS.js";
import { data, SERVISE_stop } from "../../app/start-stop.js";
import { getGroup, getUser } from "../../app/functions/getUserFNC.js";
import { c } from "../timeChecker/index.js";
import { Xitext } from "../../app/class/XitextCLS.js";
import { abc } from "../../app/functions/abcFNC.js";
import { Context } from "telegraf";

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
  specprefix: false,
  description: 'Описание',
  permisson: 0,
  hide: true,
  type: 'all'
}, (ctx, args) => {
  
})
*/

/**
 *
 * @param {Context} ctx
 * @param {*} args
 * @param {*} Dta
 * @param {import("../../app/class/cmdCLS.js").ChatCommand} command
 */
function sudo(ctx, _args, Dta, command) {
  const a = "args, ctx, g, db, data, fdata, Xitext, format",
    func = `(async () => {${ctx.message.text.replace(
      `${ctx.message.text.charAt(0)}${command.info.name} `,
      ""
    ).replace(/\n/g, ' ')}})();`;
  new Function(a, func)(a, ctx, global, database, data, Dta, Xitext, format);
}

new cmd(
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

new cmd(
  {
    name: "abc",
    description: "Описание",
    permisson: 0,
    type: "all",
  },
  (ctx, args) => {
    /**
     * @type {import("telegraf/typings/core/types/typegram.js").CommonMessageBundle}
     */
    const msg = ctx.message.reply_to_message;
    if (!msg) return ctx.reply("Отметь сообщение!");
    if (!msg.caption && !msg.text) return ctx.reply("Я не могу это перевести!");
    ctx.reply(abc(msg.text ?? msg.caption), {
      reply_to_message_id: msg.message_id,
      allow_sending_without_reply: true,
    });
  }
);

new cmd(
  {
    name: "stop",
    specprefix: true,
    hide: true,
    description: "Bot App",
    permisson: 2,
  },
  (_a, args) => {
    SERVISE_stop("Ручная остановка", null, args[0] ?? false, args[1] ?? false);
  }
);

new cmd(
  {
    name: "version",
    description: "Версия бота",
    permisson: 0,
    type: "all",
  },
  (ctx) => {
    ctx.reply(
      ...new Xitext()
        .Text(`Кобольдя `)
        .Underline(data.versionMSG.split(" ")[0])
        .Text(" ")
        .Italic(data.versionMSG.split(" ")[1])
        .Text(`\nРежим: `)
        .Bold(env.whereImRunning)
        ._Build()
    );
  }
);

new cmd(
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
        format.sendSeparatedMessage(format.stringifyEx(a, " "), ctx);
        break;
      case "get":
        if (!args[1]) return ctx.reply("Нужно указать ключ (-db get <key>)");
        const get = await database.get(args[1], true);
        console.log(get);
        format.sendSeparatedMessage(format.stringifyEx(get, " "), ctx);
        break;
      case "del":
        if (!args[1]) return ctx.reply("Нужно указать ключ (-db del <key>)");
        const del = await database.del(args[1]);
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

new cmd(
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

new cmd(
  {
    name: "env",
    hide: true,
    description: "В консоль спамит (но это полезный спам!)",
    permisson: 2,
    specprefix: true,
  },
  () => {
    const e = format.stringifyEx(env, " ");
    console.log(e);
  }
);

new cmd(
  {
    name: "call",
    prefix: "def",
    description: "Созывает",
    permisson: 1,
    type: "group",
  },
  async (ctx, args) => {
    /**
     * @type {Array<import("telegraf/typings/core/types/typegram.js").ChatMember>}
     */
    const all = [],
      g = (await getGroup(ctx, true)).group,
      group = g.cache;
    const time = Date.now() - group.lastCall;
    if (time <= 60000) {
      let sec = "секунд",
        hrs = `${time * 1000}`;
      if (hrs.endsWith("1") && hrs != "11") {
        sec = "секунду";
      } else if (hrs == "2" || hrs == "3" || hrs == "4") {
        sec = `секунды`;
      }
      return ctx.reply(
        ...new Xitext()
          .Text(`Подожди еще `)
          ._Group(hrs)
          .Bold()
          .Underline()
          .Text(` ${sec}`)
          ._Build()
      );
    }
    if (!group.members[1]) return ctx.reply("Некого созывать!");
    for (const e of group.members) {
      const obj = await ctx.telegram.getChatMember(ctx.chat.id, e);
      obj.name =
        (await database.get(`User::${e}`, true)).cache.nickname ??
        `${obj.user.first_name}${obj.user.last_name ? obj.user.last_name : ""}`;
      all.push(obj);
    }
    const mbs = all.filter(
      (e) => e.status != "kicked" && e.status != "left" && !c(e.user.id)
    );
    if (all.length != mbs.length) group.members = mbs.map((e) => e.user.id);
    group.lastCall = Date.now();
    mbs.forEach((e) => {
      const text = new Xitext()
        .Mention(e.name ?? e.user.username, e.user)
        .Text(" ")
        .Text(args[0] ? args.join(" ") : "Созыв!");
      ctx.reply(...text._Build());
    });
    await database.set(`Group::${g.static.id}`, g, true);
  }
);

new cmd(
  {
    name: "ник",
    hide: true,
    description: "Задает ник при сборе",
    permisson: 0,
    type: "group",
    specprefix: true,
  },
  async (ctx, args) => {
    const user = (await getUser(ctx, false)).user,
      name = user.cache.nickname;
    if (!args[0])
      return ctx.reply(name ?? "Пустой", {
        reply_to_message_id: ctx.message.message_id,
      });
    ctx.reply(`Ник '${name ?? "Пустой"}' сменен на '${args.join(" ")}'`, {
      reply_to_message_id: ctx.message.message_id,
      allow_sending_without_reply: true,
    });
    user.cache.nickname = args.join(" ");
    database.set("User::" + ctx.message.from.id, user, true);
  }
);

export const cooldown = 5 * 3.6e6,
  chatcooldown = 3.6e6;
new cmd(
  {
    name: "pin",
    prefix: "def",
    description: "Закрепляет на 5 часов",
    permisson: 0,
    type: "all",
  },
  async (ctx, _args, data) => {
    const g = (await getGroup(ctx, true)).group,
      u = data.DBUser ?? (await getUser(ctx, false)).user;
    let lp = 0;
    if (typeof g?.cache?.lastPin == "object") {
      lp = g.cache?.lastPin[u.static.id];
    } else g.cache.lastPin = {};
    const time = Date.now() - lp;
    if (time <= chatcooldown) {
      const min = Math.round((chatcooldown - time) / 60000),
        reply = new Xitext()
          ._Group(min)
          .Bold()
          .Url(null, d.guide(7))
          ._Group()
          .Text(" ")
          .Text(
            format
              .toMinString(min, "осталось", "осталась", "осталось")
              .split(" ")
              .slice(1)
              .join(" ")
          );
      return ctx.reply(...reply._Build({ disable_web_page_preview: true }));
    }
    if (!ctx.message?.reply_to_message?.message_id) {
      const text = new Xitext()
        .Bold("Отметь")
        .Text(" сообщение которое хочешь закрепить!");
      return ctx.reply(text._text, {
        reply_to_message_id: ctx.message.from.id,
        allow_sending_without_reply: true,
        entities: text._entities,
      });
    }
    if (g.cache.pin)
      try {
        await ctx.unpinChatMessage(Number(g.cache.pin.split("::")[0]));
      } catch (error) {
        console.warn(error);
      }

    ctx.pinChatMessage(ctx.message.reply_to_message.message_id, {
      disable_notification: true,
    });
    g.cache.lastPin[u.static.id] = Date.now();
    g.cache.pin = `${ctx.message.reply_to_message.message_id}::${Date.now()}`;
    await database.set(`Group::${g.static.id}`, g, true);
  }
);
