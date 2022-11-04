import { Command } from "../../lib/Class/Cmd.js";
import { d, format } from "../../lib/Class/Formatter.js";
import { editMsg, MultiMenuV1 } from "../../lib/Class/Menu.js";
import { Query } from "../../lib/Class/Query.js";
import { Button, Xitext } from "../../lib/Class/Xitext.js";
import { bot } from "../../lib/launch/tg.js";
import { database } from "../../index.js";

(async () => {
  const m = new MultiMenuV1("DB"),
    me = await bot.telegram.getMe(),
    lang = {
      main: (page) =>
        new Xitext()
          .Text(`(${page}) База данных `)
          .Url(format.getName(me), d.userLink(me.username)),
      generateMenu: async (page = 1) => {
        let keys = await database.keys(),
          btns = [];
        for (const e of keys.sort()) {
          btns.push([new Button(e).data(m.link("manage", e, page))]);
        }
        btns = m.generatePageSwitcher(
          btns,
          null, //new Button(m.config.backButtonSymbol).data(d.query("all", "delmsg")),
          "list",
          page
        );
        return btns;
      },
      page: (page) =>
        new Button(m.config.backButtonSymbol).data(m.link("list", page)),
      manage: (key, prevPage) =>
        new Xitext()
          .Mono(key)
          .InlineKeyboard(
            [
              new Button("Просмотреть").data(m.link("see", key, prevPage)),
              // new Button("Изменить").data(m.link("edit", key)),
            ],
            [
              // new Button("Сменить имя").data(m.link("name", key)),
              new Button("Удалить").data(m.link("del", key, prevPage)),
            ],
            [lang.page(prevPage)]
          )
          ._Build({ disable_web_page_preview: true }),
      see: (key, data, page) =>
        new Xitext()
          .Mono(key)
          .Text("\n")
          .Text(data)
          .InlineKeyboard([
            new Button("Назад").data(m.link("manage", key, page)),
          ])
          ._Build({ disable_web_page_preview: true }),
    };

  new Query(
    {
      name: "list",
      prefix: m.prefix,
      message: "Список",
    },
    async (_ctx, data, edit) => {
      edit(
        ...lang
          .main(data[0])
          .InlineKeyboard(...(await lang.generateMenu(Number(data[0]))))
          ._Build({ disable_web_page_preview: true })
      );
    }
  );

  new Query(
    {
      name: "see",
      prefix: m.prefix,
    },
    async (_ctx, data, edit) => {
      const dat = format.toStr(await database.get(data[0], true));
      edit(...lang.see(data[0], dat, data[1]));
    }
  );

  new Query(
    {
      name: "del",
      prefix: m.prefix,
    },
    async (_ctx, data, edit) => {
      await database.del(data[0]);
      edit("Успешно удалено.", {
        reply_markup: {
          inline_keyboard: await lang.generateMenu(Number(data[1])),
        },
      });
    }
  );

  new Query(
    {
      name: "manage",
      prefix: m.prefix,
    },
    async (_ctx, data, edit) => {
      edit(...lang.manage(data[0], data[1]));
    }
  );

  new Command(
    {
      name: "db2",
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
        ...lang
          .main(1)
          .InlineKeyboard(...(await lang.generateMenu(1)))
          ._Build({ disable_web_page_preview: true })
      );
    }
  );
})();
