import { Command } from "../../app/class/cmdCLS.js";
import { d, format } from "../../app/class/formatterCLS.js";
import { editMsg, MultiMenuV1 } from "../../app/class/menuCLS.js";
import { Query } from "../../app/class/queryCLS.js";
import { Button, Xitext } from "../../app/class/XitextCLS.js";
import { bot } from "../../app/setup/tg.js";
import { database } from "../../index.js";

(async () => {
  const m = new MultiMenuV1("DB"),
    me = await bot.telegram.getMe(),
    lang = {
      main: new Xitext()
        .Text("База данных бота ")
        .Url(format.getName(me), d.userLink(me.username)),
      generateMenu: async (page = 1) => {
        let keys = await database.keys(),
          btns = [];
        for (const e of keys.sort((a, b) => a - b)) {
          btns.push([new Button(e).data(m.link("manage", e))]);
        }
        btns = m.generatePageSwitcher(
          btns,
          new Button(m.config.backButtonSymbol).data(d.query("all", "delmsg")),
          "list",
          page
        );
        return btns;
      },
    };

  new Query(
    {
      name: "list",
      prefix: m.prefix,
      message: "Список",
    },
    async (_ctx, data, edit) => {
      edit(
        ...lang.main
          .InlineKeyboard(...(await lang.generateMenu(data[0])))
          ._Build({ disable_web_page_preview: true })
      );
    }
  ),
    new Command(
      {
        name: "db2",
        prefix: "def",
        description: "База данных нового поколения",
        permisson: 2,
        hide: false,
        type: "private",
      },
      async (ctx) => {
        const newMsg = await ctx.reply("Загрузка...");
        editMsg(
          ctx,
          newMsg,
          ...lang.main
            .InlineKeyboard(...(await lang.generateMenu(1)))
            ._Build({ disable_web_page_preview: true })
        );
      }
    );
})();
