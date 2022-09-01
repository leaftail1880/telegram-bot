import { env, members } from "../../app/setup/tg.js";
import { format } from "../../app/functions/formatterCLS.js";
import { database } from "../../index.js";
import { cmd } from "./index.js";
import { data, SERVISE_stop } from "../../app/start-stop.js";
import { bold, text_parse } from "../../app/functions/textFNC.js";

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
  type: 'public'
}, (ctx, args) => {
  
})
..

*bold \*text*
_italic \*text_
__underline__
~strikethrough~
||spoiler||
*bold _italic bold ~italic bold strikethrough ||italic bold strikethrough spoiler||~ __underline italic bold___ bold*
[inline URL](http://www.example.com/)
[inline mention of a user](tg://user?id=123456789)
`inline fixed-width code`
```
pre-formatted fixed-width code block
```
```python
pre-formatted fixed-width code block written in the Python programming language
```

*/

new cmd(
  {
    name: "msg",
    prefix: "hide",
    description: "Ы",
    permisson: 0,
    type: "hide",
  },
  (ctx, args) => {
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
    scopes: [
      {
        type: "default",
      },
    ],
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
    scopes: [
      {
        chat_id: members.xiller,
        type: "chat",
      },
    ],
  },
  (ctx, args) => {
    SERVISE_stop("Ручная остановка", null, args[0] ?? false, args[1] ?? false);
  }
);

new cmd(
  {
    name: "reg",
    prefix: "def",
    description: "Айди выдает",
    permisson: 0,
    scopes: [
      {
        type: "default",
      },
    ],
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
    scopes: [
      {
        type: "default",
      },
    ],
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
    scopes: [
      {
        chat_id: members.xiller,
        type: "chat",
      },
    ],
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
    prefix: "def",
    description: "Описание",
    permisson: 2,
    scopes: [
      {
        chat_id: members.xiller,
        type: "chat",
      },
    ],
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

// let calls = 0
// commands.push({ command: "call", description: "Общий сбор" });
// bot.command("reg", (ctx) => {
//   let c = false;
//   ctx.telegram.getChatMember(ctx.chat.id, ctx.message.from.id).then((e) => {
//     if (e.status == "administrator" || e.status == "creator") c = true;
//     ctx.telegram.getChatMember(ctx.chat.id)
//     ctx.
//   });
// });
