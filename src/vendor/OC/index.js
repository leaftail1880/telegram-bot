import { cmd } from "../../app/class/cmdCLS.js";
import { d, format } from "../../app/class/formatterCLS.js";
import { Query } from "../../app/class/queryCLS.js";
import { ssn } from "../../app/class/sessionCLS.js";
import { Button, Xitext } from "../../app/class/XitextCLS.js";
import { bot } from "../../app/setup/tg.js";
import { database } from "../../index.js";

/**
 * @typedef {Object} UserOC
 * @property {String} name
 * @property {String} description
 * @property {String} fileid
 */

export const maxButtonsRows = 12,
  maxButtonsPerRow = 6;

const lang = {
  main: new Xitext()
    .Text("Выбери действие с ")
    ._Group("OC")
    .Bold()
    .Italic()
    .Underline()
    .Text(":"),
  reg0: new Xitext()
    .Text(
      "Что бы прикрепить своего ОС (персонажа) к этому боту для поиска, отправь референс ОС ввиде "
    )
    ._Group("файла")
    .Bold()
    .Underline()
    ._Group()
    .Text(". (Что бы отправить фото как файл, нажми на ")
    .Bold("значок вложения")
    .Text(" в правом нижнем углу, а затем ")
    .Bold("Файл")
    .Text(" > ")
    .Bold("Галерея")
    .Text(")\nЧто бы выйти из этого пошагового меню используй команду /cancel"),
  red0: new Xitext()
    .Text("Отправь новый референс персонажа ввиде ")
    ._Group("файла")
    .Bold()
    .Underline()
    ._Group()
    .Text(". (Что бы отправить фото как файл, нажми на ")
    .Bold("значок вложения")
    .Text(" в правом нижнем углу, а затем ")
    .Bold("Файл")
    .Text(" > ")
    .Bold("Галерея")
    .Text(
      ")\nЕсли не хочешь менять референс, используй /next\nЧто бы выйти из этого пошагового меню используй команду /cancel"
    ),
  maxLength: new Xitext()
    .Text("Имя должно быть ")
    ._Group("НЕ")
    .Bold()
    .Underline()
    ._Group()
    .Text(" больше 32 символов в длину")
    ._Build(),
  find: "Список владельцев ОС",
  userOCS: (name) => `Персонажи ${name}`,
  myOCS: "Ваши персонажи",
  OC: (name, description, ownerName, owner) =>
    new Xitext()
      ._Group(name)
      .Bold()
      .Url(null, `t.me/${owner}`)
      ._Group()
      .Text(`\n${description}\n\n`)
      .Bold(`Персонаж `)
      .Url(ownerName, `t.me/${owner}`),
  myOC: (name, description, owner) =>
    new Xitext()
      ._Group(name)
      .Bold()
      .Url(null, `t.me/${owner}`)
      ._Group()
      .Text(`\n${description}\n\n`)
      .Bold(`Это Ваш персонаж`),
};

const MENU = {
  MyOC: [
    new Query(
      {
        name: "my",
        prefix: "OC",
      },
      async (ctx, data) => {
        const OCS = (await database.get(d.pn("Module", "OC"), true)) ?? {};
        if (!OCS[ctx.callbackQuery.from.id]?.map) {
          return ctx.answerCbQuery("У вас нет ОС!", { show_alert: true });
        }
        const btns = [],
          userOCS = OCS[ctx.callbackQuery.from.id],
          menu = [new Button("↩️").data(`OC::back`)]
        for (const [i, e] of userOCS.entries()) {
          btns.push([
            new Button(e.name).data(
              `OC::MC::${ctx.callbackQuery.from.id}::${i}::${ctx.callbackQuery.from.username}`
            ),
          ]);
        }
        ctx.answerCbQuery("Ваши персонажи");
        btns.push(menu);
        await ctx.telegram.editMessageText(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id,
          ctx.callbackQuery.inline_message_id,
          lang.myOCS
        );
        await ctx.telegram.editMessageReplyMarkup(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id,
          ctx.callbackQuery.inline_message_id,
          { inline_keyboard: btns }
        );
      }
    ),

    new Query(
      {
        name: "MC",
        prefix: "OC",
      },
      async (ctx, data) => {
        const OCS = (await database.get(d.pn("Module", "OC"), true)) ?? {}
        if (!data[1] || !OCS[data[2]]?.map || !OCS[data[2]][data[3]])
          return ctx.answerCbQuery("Нету OC!", { show_alert: true });
        const OC =
          OCS[ctx.callbackQuery.data.split("::")[2]][
            ctx.callbackQuery.data.split("::")[3]
          ];
        ctx.answerCbQuery(OC.name);
        const capt = lang.myOC(OC.name, OC.description, data[4]);
        ctx.replyWithDocument(OC.fileid, {
          caption: capt._text,
          caption_entities: capt._entities,
          reply_markup: {
            inline_keyboard: [
              [
                new Button("Изменить").data(
                  //
                  `OC::redact::${data[2]}::${data[3]}`
                ),
              ],
              [new Button("Удалить").data("OC::del")],
            ],
          },
        });
      }
    ),

    [
      new Query(
        {
          name: "redact",
          prefix: "OC",
          message: "Редактирование",
        },
        (ctx, data) => {
          ssn.OC.enter(ctx.callbackQuery.from.id, 10, [data[2], data[3]], true);
          ctx.reply(...lang.reg0._Build());
        }
      ),

      ssn.OC.nextExecuter(10, async (ctx, user) => {
        const OCS = (await database.get(d.pn("Module", "OC"), true)) ?? {},
          uOC = OCS[ctx.from.id];
        if (
          !user?.cache?.sessionCache[1] ||
          !uOC ||
          !uOC[user?.cache?.sessionCache[1]]
        ) {
          ssn.OC.exit(ctx.from.id);
          ctx.reply(
            "Ошибка 425: Не найден кэш сессии. Я хз как это могло произойти, попробуй перезайти в меню."
          );
          console.warn(
            `ERR 425: No session cache. User: ${
              ctx.from.username ?? ctx.from.id
            }, Text: ${ctx.message.text}`
          );
          return
        }
        const oc = uOC[user?.cache?.sessionCache[1]];
        ssn.OC.enter(ctx.from.id, 11, oc.fileid);
        ctx.reply(
          "Теперь отправь мне новое имя персонажа.(Не более 32 символов)\nОставить старое: /next "
        );
      }),

      // 1 этап, фото
      bot.on("document", async (ctx, next) => {
        const qq = await ssn.OC.Q(ctx.from.id, true);
        if (ctx.chat.type != "private" || qq === "not" || qq.session != 10)
          return next();
        ssn.OC.enter(ctx.from.id, 11, ctx.message.document.file_id);
        ctx.reply(
          "Теперь отправь мне новое имя персонажа.(Не более 32 символов)\nОставить старое: /next "
        );
      }),

      ssn.OC.nextExecuter(11, async (ctx, user) => {
        const OCS = (await database.get(d.pn("Module", "OC"), true)) ?? {},
          uOC = OCS[ctx.from.id];
        if (
          !user?.cache?.sessionCache[1] ||
          !uOC ||
          !uOC[user?.cache?.sessionCache[1]]
        ) {
          ssn.OC.exit(ctx.from.id);
          ctx.reply(
            "Ошибка 425: Не найден кэш сессии. Я хз как это могло произойти, попробуй перезайти в меню."
          );
          console.warn(
            `ERR 422: No session cache. User: ${
              ctx.from.username ?? ctx.from.id
            }, Text: ${ctx.message.text}`
          );
          return
        }
        const oc = uOC[user?.cache?.sessionCache[1]];
        ssn.OC.enter(ctx.from.id, 12, oc.description);
        ctx.reply(
          "Теперь отправь мне новое описание персонажа. (Ссылку на тг акк в нем оставлять не надо, я делаю это за вас при поиске))\nОставить старое: /next "
        );
      }),

      // 2 этап, имя
      bot.on("text", async (ctx, next) => {
        const qq = await ssn.OC.Q(ctx.from.id, true);
        if (
          ctx.chat.type != "private" ||
          qq === "not" ||
          qq.session != 11 ||
          !ctx.message.text
        )
          return next();
        if (!qq?.user?.cache?.sessionCache?.map) {
          ssn.OC.exit(ctx.from.id);
          ctx.reply(
            "Ошибка 422: Не найден кэш сессии. Я хз как это могло произойти, попробуй перезайти в меню."
          );
          console.warn(
            `ERR 422: No session cache. User: ${
              ctx.from.username ?? ctx.from.id
            }, Text: ${ctx.message.text}`
          );
          return next();
        }
        if (ctx.message.text.length > 16) {
          return ctx.reply(...lang.maxLength);
        }
        ssn.OC.enter(ctx.from.id, 12, ctx.message.text);
        ctx.reply(
          "Теперь отправь мне новое описание персонажа. (Ссылку на тг акк в нем оставлять не надо, я делаю это за вас при поиске))\nОставить старое: /next "
        );
      }),

      ssn.OC.nextExecuter(12, async (ctx, user) => {
        const OCS = (await database.get(d.pn("Module", "OC"), true)) ?? {},
          uOC = OCS[ctx.from.id];
        if (
          !user?.cache?.sessionCache[1] ||
          !uOC ||
          !uOC[user?.cache?.sessionCache[1]]
        ) {
          ssn.OC.exit(ctx.from.id);
          ctx.reply(
            "Ошибка 425: Не найден кэш сессии. Я хз как это могло произойти, попробуй перезайти в меню."
          );
          console.warn(
            `ERR 422: No session cache. User: ${
              ctx.from.username ?? ctx.from.id
            }, Text: ${ctx.message.text}`
          );
        }
        const oc = uOC[user?.cache?.sessionCache[1]];
        saveOC(
          ctx.from.id,
          {
            name: user.cache.sessionCache[3],
            fileid: user.cache.sessionCache[2],
            description: oc.description,
          },
          OCS,
          user.cache.sessionCache[1]
        );
        ssn.OC.exit(ctx.from.id);
        ctx.reply(
          "Теперь отправь мне новое описание персонажа. (Ссылку на тг акк в нем оставлять не надо, я делаю это за вас при поиске))\nОставить старое: /next "
        );
      }),

      // 3 этап - описание
      bot.on("text", async (ctx, next) => {
        const qq = await ssn.OC.Q(ctx.from.id, true);
        if (
          ctx.chat.type != "private" ||
          qq === "not" ||
          qq.session != 12 ||
          !ctx.message.text
        )
          return next();
        const OCS = (await database.get(d.pn("Module", "OC"), true)) ?? {};
        if (
          !qq?.user?.cache?.sessionCache?.map ||
          !qq.user.cache.sessionCache[1]
        ) {
          ssn.OC.exit(ctx.from.id);
          ctx.reply(
            "Ошибка 423: Не найден кэш сессии. Я хз как это могло произойти, попробуй перезайти в меню."
          );
          console.warn(
            `ERR 423: No session cache. User: ${
              ctx.from.username ?? ctx.from.id
            }, Text: ${ctx.message.text}`
          );
          return next();
        }
        saveOC(
          ctx.from.id,
          {
            name: qq.user.cache.sessionCache[2],
            fileid: qq.user.cache.sessionCache[1],
            description: ctx.message.text,
          },
          OCS,
          qq.user.cache.sessionCache[0]
        );
        ssn.OC.exit(ctx.from.id);
        ctx.reply("Успешно изменено! /oc");
      }),
    ],
  ],
  Find: [
    new Query(
      {
        name: "find",
        prefix: "OC",
        message: "Поиск",
      },
      async (ctx) => {
        const OCS = (await database.get(d.pn("Module", "OC"), true)) ?? {},
          keys = Object.keys(OCS);
        if (!keys[0])
          return ctx.answerCbQuery("Нету OC!", { show_alert: true });
        const btns = [],
          menu = [new Button("↩️").data("OC::back")],
          page =
            Number(ctx.callbackQuery.data.split("::")[2]) == NaN
              ? Number(ctx.callbackQuery.data.split("::")[2])
              : 0;
        for (const e of keys) {
          try {
            const user = (await ctx.telegram.getChatMember(e, Number(e))).user,
              u = format.getName(user);
            if (u)
              btns.push([
                new Button(u).data(
                  `OC::userOCs::${e}::${page}::${u}::${user.username}`
                ),
              ]);
          } catch (e) {}
        }
        const qMax = Math.ceil(keys.length / maxButtonsRows) - 1,
          qNext = qMax >= page + 1;
        btns.splice(maxButtonsRows * page - page, maxButtonsRows * page);

        if (page > 0)
          menu.unshift(new Button("⏪").data(d.pn("OC::find", page - 1)));
        if (qNext) menu.push(new Button("⏩").data(d.pn("OC::find", page + 1)));
        btns.push(menu);
        await ctx.telegram.editMessageText(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id,
          ctx.callbackQuery.inline_message_id,
          lang.find
        );
        await ctx.telegram.editMessageReplyMarkup(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id,
          ctx.callbackQuery.inline_message_id,
          { inline_keyboard: btns }
        );
      }
    ),

    new Query(
      {
        name: "userOCs",
        prefix: "OC",
      },
      async (ctx) => {
        const OCS = (await database.get(d.pn("Module", "OC"), true)) ?? {};
        if (!OCS[ctx.callbackQuery.data.split("::")[2]]?.map)
          return ctx.answerCbQuery("Нету OC!", { show_alert: true });
        const btns = [],
          data = ctx.callbackQuery.data.split("::"),
          userOCS = OCS[data[2]],
          menu = [new Button("↩️").data(`OC::find::${data[3]}`)];
        for (const [i, e] of userOCS.entries()) {
          btns.push([
            new Button(e.name).data(
              `OC::oc::${data[2]}::${i}::${data[4]}::${data[5]}`
            ),
          ]);
        }
        ctx.answerCbQuery("ОС " + data[4]);
        btns.push(menu);
        await ctx.telegram.editMessageText(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id,
          ctx.callbackQuery.inline_message_id,
          lang.userOCS(data[4])
        );
        await ctx.telegram.editMessageReplyMarkup(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id,
          ctx.callbackQuery.inline_message_id,
          { inline_keyboard: btns }
        );
      }
    ),

    new Query(
      {
        name: "oc",
        prefix: "OC",
      },
      async (ctx) => {
        const OCS = (await database.get(d.pn("Module", "OC"), true)) ?? {},
          data = ctx.callbackQuery.data.split("::");
        if (!data[1] || !OCS[data[2]]?.map || !OCS[data[2]][data[3]])
          return ctx.answerCbQuery("Нету OC!", { show_alert: true });
        const OC =
          OCS[ctx.callbackQuery.data.split("::")[2]][
            ctx.callbackQuery.data.split("::")[3]
          ];
        ctx.answerCbQuery(OC.name);
        const capt = lang.OC(OC.name, OC.description, data[4], data[5]);
        ctx.replyWithDocument(OC.fileid, {
          caption: capt._text,
          caption_entities: capt._entities,
        });
      }
    ),
  ],
  Reg: [
    new Query(
      {
        name: "reg",
        prefix: "OC",
        message: "Регистрация",
      },
      (ctx) => {
        ssn.OC.enter(ctx.callbackQuery.from.id, 0);
        //ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        ctx.reply(...lang.reg0._Build());
      }
    ),
    // 1 этап, фото
    bot.on("document", async (ctx, next) => {
      const qq = await ssn.OC.Q(ctx.from.id, true);
      if (ctx.chat.type != "private" || qq === "not" || qq.session != 0)
        return next();
      ssn.OC.enter(ctx.from.id, 1, [ctx.message.document.file_id], true);
      ctx.reply("Теперь отправь мне имя персонажа. (Не более 32 символов)");
    }),

    // 2 этап, имя
    bot.on("text", async (ctx, next) => {
      const qq = await ssn.OC.Q(ctx.from.id, true);
      if (
        ctx.chat.type != "private" ||
        qq === "not" ||
        qq.session != 1 ||
        !ctx.message.text
      )
        return next();
      if (!qq?.user?.cache?.sessionCache?.map) {
        ssn.OC.exit(ctx.from.id);
        ctx.reply(
          "Ошибка 420: Не найден кэш сессии. Я хз как это могло произойти, попробуй перезайти в меню."
        );
        console.warn(
          `ERR 420: No session cache. User: ${
            ctx.from.username ?? ctx.from.id
          }, Text: ${ctx.message.text}`
        );
        return next();
      }
      if (ctx.message.text.length > 32) {
        return ctx.reply(...lang.maxLength);
      }
      ssn.OC.enter(ctx.from.id, 2, ctx.message.text);
      ctx.reply(
        "Теперь отправь мне описание персонажа. (Ссылку на тг акк в нем оставлять не надо, я делаю это за вас при поиске))"
      );
    }),

    // 3 этап - описание
    bot.on("text", async (ctx, next) => {
      const qq = await ssn.OC.Q(ctx.from.id, true);
      if (
        ctx.chat.type != "private" ||
        qq === "not" ||
        qq.session != 2 ||
        !ctx.message.text
      )
        return next();
      const OCS = (await database.get(d.pn("Module", "OC"), true)) ?? {},
        userOC = OCS[ctx.from.id] ?? [];
      if (
        !qq?.user?.cache?.sessionCache?.map ||
        !qq.user.cache.sessionCache[1]
      ) {
        ssn.OC.exit(ctx.from.id);
        ctx.reply(
          "Ошибка 421: Не найден кэш сессии. Я хз как это могло произойти, попробуй перезайти в меню."
        );
        console.warn(
          `ERR 421: No session cache. User: ${
            ctx.from.username ?? ctx.from.id
          }, Text: ${ctx.message.text}`
        );
        return next();
      }
      saveOC(ctx.from.id, {
        name: qq.user.cache.sessionCache[1],
        fileid: qq.user.cache.sessionCache[0],
        description: ctx.message.text,
      }, OCS)
      ssn.OC.exit(ctx.from.id);
      ctx.reply("Успешно! /oc");
    }),
  ],
  MainMenu: [
    new cmd(
      {
        name: "oc",
        prefix: "def",
        description: "Все действия с OC",
        permisson: 0,
        type: "private",
      },
      (ctx) => {
        ctx.reply(
          ...lang.main
            .InlineKeyboard(
              [new Button("Добавить").data("OC::reg")],
              [new Button("Найти").data("OC::find")],
              [new Button("Мои персонажи").data("OC::my")]
            )
            ._Build()
        );
      }
    ),
    new Query(
      {
        name: "back",
        prefix: "OC",
        message: "Назад",
      },
      async (ctx) => {
        await ctx.telegram.editMessageText(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id,
          ctx.callbackQuery.inline_message_id,
          lang.main._text,
          { entities: lang.main._entities }
        );
        await ctx.telegram.editMessageReplyMarkup(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id,
          ctx.callbackQuery.inline_message_id,
          {
            inline_keyboard: [
              [new Button("Добавить").data("OC::reg")],
              [new Button("Найти").data("OC::find")],
              [new Button("Мои персонажи").data("OC::my")],
            ],
          }
        );
      }
    ),
  ],
};

function saveOC(id, oc, OCS, index) {
  console.log(`${index ? 'Redacted ' : 'Created new '} oc. Name: ${oc.name}`)
  const userOC = OCS[id] ?? [];
  index ? (userOC[index] = oc) : userOC.push(oc);
  OCS[id] = userOC;
  database.set(d.pn("Module", "OC"), OCS, true);
}
