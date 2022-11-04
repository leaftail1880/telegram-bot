import { database } from "../../../index.js";
import { Command } from "../../../lib/Class/Cmd.js";
import { Xitext } from "../../../lib/Class/Xitext.js";

new Command(
  {
    name: "log",
    hide: true,
    description: "Управление логированием",
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
          "В кэшэ успешно сохранено " + database.log.length + " строчек лога."
        );
        break;
      case "log":
        const log = database.logFormat().join("\n");
        console.log(log);
        ctx.reply(log);
        break;
      default:
        ctx.reply(
          ...new Xitext()
            .Text("Доступные методы:\n ")
            .Mono("average")
            .Text("\n ")
            .Mono("save")
            .Text("\n ")
            .Mono("log")
            ._Build()
        );
        break;
    }
  }
);
