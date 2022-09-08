import { env } from "../../app/setup/tg.js";
import { format } from "../../app/class/formatterCLS.js";
import { database } from "../../index.js";
import { cmd } from "../../app/class/cmdCLS.js";
import { data, SERVISE_stop } from "../../app/start-stop.js";
import { getGroup, getUser } from "../../app/functions/getUserFNC.js";
import { c } from "../timeChecker/index.js";
import { Xitext } from "../../app/class/XitextCLS.js";

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
        format.sendSeparatedMessage(format.stringifyEx(a, " "), ctx)
        break;
      case "get":
        if (!args[1]) return ctx.reply("Нужно указать ключ (-db get <key>)");
        const get = await database.get(args[1], true);
        console.log(get);
        format.sendSeparatedMessage(format.stringifyEx(get, " "), ctx)
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

export const cooldown = 5 * 3.6e6;
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
    if (typeof g?.cache?.lastPin == "object") {
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
      const reply = new Xitext().Bold(hrs).Text(` ${o}`);
      return ctx.reply(...reply._Build());
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

// new cmd(
//   {
//     name: "animtitle",
//     prefix: "hide",
//     description: " ы",
//     permisson: 1,
//     type: "group",
//   },
//   async (ctx, args) => {
//     if (!args || !args[0] || !args[1] || Number(args[0]) == NaN)
//       return ctx.reply("Че?");
//     const group = (await getGroup(ctx, true)).group,
//       oldtitle = `${group.cache.titleAnimationSpeed ?? 0} ${
//         group.cache?.titleAnimation?.join(" ") ?? group.static.title
//       }`,
//       anims = [];
//     args.forEach((e) => anims.push(e));
//     anims.shift();
//     group.cache.titleAnimationSpeed = Number(args[0]);
//     group.cache.titleAnimation = anims;
//     ctx.reply(
//       `Сменена анимация имени группы:\n ${anims.join("\n ")}\n\nСкорость: ${
//         args[0]
//       } сек.\n\nВернуть старую: -animtitle ${oldtitle}`
//     );
//     await database.set(`Group::${group.static.id}`, group, true);
//     SetAnimations();
//   }
// );

// new cmd(
//   {
//     name: "animreload",
//     prefix: "hide",
//     description: " ы",
//     permisson: 1,
//     type: "group",
//   },
//   async (ctx, args) => {
//     ctx.reply("Успешно!");
//     SetAnimations();
//   }
// );

// new cmd(
//   {
//     name: "newoc",
//     prefix: "def",
//     description: "Как зарегать",
//     permisson: 0,
//     type: "private",
//   },
//   async (ctx, args) => {
//     // if (!ctx.message?.reply_to_message?.message_id)
//     //   return ctx.reply("Отметь файл с изображением!", {
//     //     reply_to_message_id: ctx.message.message_id,
//     //     allow_sending_without_reply: true,
//     //   });
//     // const id = ctx.message?.reply_to_message?.message_id, msg = await ctx.telegram.
//     ctx.reply(
//       'Что бы зарегистрировать ОС, отправь мне файл (именно файл, а не фото!) с референсом персонажа, и подписью в формате <Имя персонажа> <Описание>\n  Примеры подписей:\n Листохвост Известный кобольдя\n "Ре На" Рандомное имя придуманное что бы показать как делать имена с пробелами'
//     );
//   }
// );
