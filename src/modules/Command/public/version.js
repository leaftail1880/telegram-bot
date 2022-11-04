import { Command } from "../../../lib/Class/Cmd.js";
import { d } from "../../../lib/Class/Formatter.js";
import { Xitext } from "../../../lib/Class/Xitext.js";
import { env } from "../../../lib/launch/tg.js";
import { data } from "../../../lib/start-stop.js";

new Command(
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
        ._Group(data.versionMSG.split(" ")[0])
        .Url(null, d.guide(8))
        .Bold()
        ._Group()
        .Text(" ")
        .Italic(data.versionMSG.split(" ")[1])
        .Text(`\nРежим: `)
        .Bold(env.whereImRunning)
        ._Build({ disable_web_page_preview: true })
    );
  }
);
