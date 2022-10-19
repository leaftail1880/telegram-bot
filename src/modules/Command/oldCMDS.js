import { Command } from "../../app/class/cmdCLS.js";
import { d } from "../../app/class/formatterCLS.js";
import { Xitext } from "../../app/class/XitextCLS.js";
import { env } from "../../app/setup/tg.js";
import { data } from "../../app/start-stop.js";
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
  specprefix: false,
  description: 'Описание',
  permisson: 0,
  hide: false,
  type: 'all'
}, (ctx, args) => {
  
})
*/

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
