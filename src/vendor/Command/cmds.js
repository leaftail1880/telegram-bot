import { env, members } from "../../app/setup/tg.js";
import { format } from "../../app/functions/formatterCLS.js";
import { database } from "../../index.js";
import { cmd } from "./index.js";
import { data, SERVISE_stop } from "../../app/start-stop.js";
import { bold, mention, text_parse } from "../../app/functions/textFNC.js";
import { getGroup, getUser } from "../UserDB/index.js";
import { c } from "../timeChecker/index.js";

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
  prefix: 'def',
  description: 'Описание',
  permisson: 0,
  type: 'all'
}, (ctx, args) => {
  
})
*/

new cmd(
  {
    name: "msg",
    prefix: "hide",
    description: "Ы",
    permisson: 0,
    type: "hide",
  },
  (ctx, _args) => {
    const text = text_parse(["text ", bold("bold text"), " normal text"]);
    ctx.reply(text.newtext, { entities: text.extra });
  }
);

new cmd(
  {
    name: "chat",
    prefix: "def",
    description: "Информация о чате",
    permisson: 0,
    type: "group",
  },
  (ctx) => {
    ctx.reply(
      `Id: ${ctx.chat.id}\nTitle: ${ctx.chat.title ?? "Пустой"}\nType: ${
        ctx.chat.type
      }`
    );
  }
);

new cmd(
  {
    name: "stop",
    prefix: "hide",
    description: "Информация о чате",
    permisson: 2,
  },
  (_a, args) => {
    SERVISE_stop("Ручная остановка", null, args[0] ?? false, args[1] ?? false);
  }
);

new cmd(
  {
    name: "reg",
    prefix: "def",
    description: "Айди выдает",
    permisson: 0,
    type: "group",
  },
  (ctx) => {
    ctx.reply("Твой айди: " + ctx.message.from.id);
  }
);

new cmd(
  {
    name: "version",
    prefix: "def",
    description: "Версия бота",
    permisson: 0,
    type: "all",
  },
  async (ctx) => {
    ctx.reply(
      `Сейчас запущен Кобольдя ${data.versionMSG}\nРежим: ${env.whereImRunning}`
    );
  }
);

new cmd(
  {
    name: "db",
    prefix: "def",
    description: "Описание",
    permisson: 2,
  },
  async (ctx, args) => {
    switch (args[0]) {
      case "pairs":
        const a = await database.getPairs();
        console.log(a);
        ctx.reply(format.stringifyEx(a, " "));
        break;
      case "get":
        if (!args[1]) return ctx.reply("Нужно указать ключ (-db get <key>)");
        const get = await database.get(args[1], true);
        console.log(get);
        ctx.reply(format.stringifyEx(get, " "));
        break;
      case "del":
        if (!args[1]) return ctx.reply("Нужно указать ключ (-db del <key>)");
        const del = await database.del(args[1]);
        console.log(del);
        ctx.reply(del);
        break;
      case "keys":
        const keys = await database.keys();
        console.log(keys);

        ctx.reply("Ключи: " + keys.join(", "));
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
          "Доступные методы:\n pairs\n get <key>\n set <key> <value>\n keys\n del <key>\n help"
        );
    }
  }
);

new cmd(
  {
    name: "log",
    prefix: "hide",
    description: "Описание",
    permisson: 2,
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
    prefix: "hide",
    description: "В консоль спамит (но это полезный спам!)",
    permisson: 2,
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
      const reply = text_parse([`Подожди еще `, bold(hrs), ` ${sec}`]);
      return ctx.reply(reply.newtext, { entities: reply.extra });
    }
    if (!group.members[1]) return ctx.reply("Некого созывать!");
    for (const e of group.members) {
      const obj = await ctx.telegram.getChatMember(ctx.chat.id, e);
      obj.name =
        (await database.get(`User::${e}`, true)).cache.nickmame ??
        `${obj.user.first_name}${obj.user.last_name ? obj.user.last_name : ""}`;
      all.push(obj);
    }
    const mbs = all.filter(
      (e) => e.status != "kicked" && e.status != "left" && !c(e.user.id)
    );
    if (all.length != mbs.length) group.members = mbs.map((e) => e.user.id);
    group.lastCall = Date.now();
    mbs.forEach((e) => {
      const text = text_parse([
        mention(e.name ?? e.user.username, e.user),
        " ",
        args[0] ? args.join(" ") : "Созыв!",
      ]);
      ctx.reply(text.newtext, { entities: text.extra });
    });
    await database.set(`Group::${g.static.id}`, g, true);
  }
);

new cmd(
  {
    name: "ник",
    prefix: "hide",
    description: "Задает ник при сборе",
    permisson: 0,
    type: "group",
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

export const cooldown = 5 * 3.6e6
new cmd(
  {
    name: "pin",
    prefix: "def",
    description: "Закрепляет на 5 часов",
    permisson: 0,
    type: "all",
  },
  async (ctx) => {
    const g = (await getGroup(ctx, true)).group,
      u = (await getUser(ctx, false)).user;
    let lp = 0;
    if (typeof g.cache?.lastPin == "object") {
      lp = g.cache?.lastPin[u.static.id];
    } else g.cache.lastPin = {};
    const time = Date.now() - lp;
    if (time <= cooldown) {
      const hrs = `${Math.ceil(time / 3.6e6)}`;
      let o;
      if (hrs.endsWith("1") && hrs != "11") {
        o = "час cостался!";
      } else if (hrs.endsWith("2") || hrs.endsWith("3") || hrs.endsWith("4")) {
        o = `часa осталось`;
      } else {
        o = `часов осталось`;
      }
      const reply = text_parse([bold(hrs), ` ${o}`]);
      return ctx.reply(reply.newtext, { entities: reply.extra });
    }
    if (!ctx.message.reply_to_message.message_id) {
      const text = text_parse([
        bold("Отметь"),
        " сообщение которое хочешь закрепить!",
      ]);
      return ctx.reply(text.newtext, {
        reply_to_message_id: ctx.message.from.id,
        allow_sending_without_reply: true,
        entities: text.extra,
      });
    }
    if (g.cache.pin)
      try {
        await ctx.unpinChatMessage(Number(g.cache.pin.split("::")[0]));
      } catch (error) {
        console.warn(error)
      }

    ctx.pinChatMessage(ctx.message.reply_to_message.message_id, {
      disable_notification: true,
    });
    g.cache.lastPin[u.static.id] = Date.now();
    g.cache.pin = `${ctx.message.reply_to_message.message_id}::${Date.now()}`;
    await database.set(`Group::${g.static.id}`, g, true);
  }
);
