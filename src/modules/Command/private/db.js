import { database } from "../../../index.js";
import { Command } from "../../../lib/Class/Cmd.js";
import { format } from "../../../lib/Class/Formatter.js";
import { Xitext } from "../../../lib/Class/Xitext.js";

new Command(
  {
    name: "db",
    description: "Cтарая база данных",
    permisson: 2,
  },
  async (ctx, args) => {
    switch (args[0]) {
      case "pairs":
        const a = await database.getPairs();
        console.log(a);
        format.sendSeparatedMessage(format.toStr(a, " "), ctx.reply);
        break;
      case "get":
        if (!args[1]) return ctx.reply("Нужно указать ключ (-db get <key>)");
        const get = await database.get(args[1], true);
        console.log(get);
        format.sendSeparatedMessage(format.toStr(get, " "), (msg) =>
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
