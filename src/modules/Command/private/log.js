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
        const a = await database.log.averageTime();
        console.log(a);
        ctx.reply(
          `Cредняя скорость ответа сервера для методов:\n${Object.keys(a)
            .map((e) => ` ${e}: ${a[e]}`)
            .join("\n")}`
        );
        break;
      case "save":
        database.log.save();
        ctx.reply(
          "В кэшэ успешно сохранено " +
            database.log.log.length +
            " строчек лога."
        );
        break;
      case "log":
        const log = database.log.format().join("\n");
        console.log(log);
        ctx.reply(log);
        break;
      default:
        ctx.reply(
          ...new Xitext()
            .text("Доступные методы:\n ")
            .mono("average")
            .text("\n ")
            .mono("save")
            .text("\n ")
            .mono("log")
            ._.build()
        );
        break;
    }
  }
);
