import { Context } from "telegraf";
import { Command } from "../../lib/class/cmdCLS.js";
import { EventListener } from "../../lib/class/EventsCLS.js";
import { d, format } from "../../lib/class/formatterCLS.js";
import { MultiMenuV1 } from "../../lib/class/menuCLS.js";
import { Query } from "../../lib/class/queryCLS.js";
import { ssn } from "../../lib/class/sessionCLS.js";
import { Button, Xitext } from "../../lib/class/XitextCLS.js";
import { err } from "../../lib/functions/errFNC.js";
import { data } from "../../lib/start-stop.js";
import { database } from "../../index.js";

const _data = data;
/**
 * @typedef {Object} UserOC
 * @property {string} name
 * @property {string} description
 * @property {string} fileid
 */

export const m = new MultiMenuV1("OC"),
  maxButtonsRows = m.config.maxRows,
  link = m.link.bind(m),
  editMsg = m.editMsgFromQuery.bind(m),
  not = m.notPrivateChat.bind(m),
  cacheEmpty = (qq, lvl) => m.isCacheEmpty(qq?.user, lvl);

/*------------------------------------------ ЯЗЫК ------------------------------------------*/
export const lang = {
  create: {
    name: "Теперь отправь мне имя персонажа. (Не более 32 символов)",
    description:
      "Теперь отправь мне описание персонажа. (Ссылку на тг акк в нем оставлять не надо, я делаю это за вас при поиске))",
    done: "Успешно! /oc",
  },
  skip: (t) => `${t}\nПропустить: /next`,
  redact: {
    name: () => lang.skip(lang.create.name),
    description: () => lang.skip(lang.create.description),
  },
  mainKeyboard: [
    [new Button("Добавить").data(link("reg"))],
    [new Button("Найти").data(link("find"))],
    [new Button("Мои персонажи").data(link("my"))],
  ],
  main: new Xitext()
    .Text("Меню ")
    ._Group("OC")
    .Bold()
    .Url(null, d.guide(6))
    .Text(" (Или гифтменю):"),
  reg0: new Xitext()
    .Text(
      "Что бы прикрепить своего ОС к этому боту, отправь референс ОС ввиде "
    )
    ._Group("файла")
    .Bold()
    .Url(null, d.guide(5))
    ._Group()
    .Text("\n Что бы выйти из этого пошагового меню используй команду /cancel"),
  red0: new Xitext()
    .Text("Отправь новый референс персонажа ввиде ")
    ._Group("файла")
    .Bold()
    .Url(null, d.guide(5))
    ._Group()
    .Text(
      "\n\n Если хочешь оставить прошлый референс, используй /next\n Что бы выйти из этого пошагового меню используй команду /cancel"
    ),
  maxLength: (type, length) =>
    new Xitext()
      .Text(`${type} должно быть `)
      ._Group("НЕ")
      .Bold()
      ._Group()
      .Text(` больше ${length} символов в длину`)
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
      .Text(`\n  ${description}\n\n`)
      .Bold(`Владелец: `)
      .Url(ownerName, `t.me/${owner}`),
  myOC: (name, description, owner) =>
    new Xitext()
      ._Group(name)
      .Bold()
      .Url(null, `t.me/${owner}`)
      ._Group()
      .Text(`\n  ${description}\n\n`)
      .Bold(`Это Ваш персонаж`),
};
/*------------------------------------------------------------------------------------*/

/*------------------------------------------ ФУНКЦИИ ------------------------------------------*/
/**
 * @returns {Promise<Object>}
 */
async function getOCS() {
  const OCS = (await database.get(d.pn("Module", "OC"), true)) ?? {};
  Object.keys(OCS).forEach((e) => {
    const ar = OCS[e] ?? [];
    OCS[e] = ar.filter((e) => e);
    if (!OCS[e][0]) delete OCS[e];
  });
  return OCS;
}

/**
 *
 * @param {number} id
 * @param {UserOC} oc
 * @param {number} [index]
 */
async function saveOC(id, oc, index) {
  console.log(
    `> OC. ${index ? "Redacted" : "Created new"} oc. Name: ${oc.name}`
  );
  const OCS = await getOCS(),
    userOC = OCS[id] ?? [];
  index ? (userOC[index] = oc) : userOC.push(oc);
  OCS[id] = userOC;
  database.set(d.pn("Module", "OC"), OCS, true);
}

/**
 *
 * @param {number} id
 * @param {number} index
 */
async function delOC(id, index) {
  const OCS = await getOCS(),
    userOC = OCS[id] ?? [];
  console.log(`> OC. Deleted oc. Name: ${userOC[index]?.name}`);
  delete userOC[index];
  database.set(d.pn("Module", "OC"), OCS, true);
}

/**
 *
 * @param {Context} ctx
 * @param {string} text
 * @param {Array<Array<import("telegraf/types").InlineKeyboardButton>>} InlineKeyboard
 */
async function sendMsgDelDoc(ctx, text, entities, InlineKeyboard, delType) {
  /**
   * @type {import("telegraf/types").Convenience.ExtraReplyMessage}
   */
  let extra = {
    disable_web_page_preview: true,
  };
  if (entities) extra.entities = entities;
  if (InlineKeyboard) extra.reply_markup = { inline_keyboard: InlineKeyboard };

  await ctx.telegram.deleteMessage(
    ctx.callbackQuery.message.chat.id,
    ctx.callbackQuery.message.message_id
  );
  if (delType === "mm")
    await ctx.telegram.deleteMessage(
      ctx.callbackQuery.message.chat.id,
      ctx.callbackQuery.message.message_id - 1
    );

  await ctx.reply(text, extra);
}

/**
 *
 * @param {Context} ctx
 * @param {string} text
 * @param {Array<Array<import("telegraf/types").InlineKeyboardButton>>} InlineKeyboard
 */
async function sendRef(ctx, fileid, text, entities, InlineKeyboard) {
  await ctx.telegram.deleteMessage(
    ctx.callbackQuery.message.chat.id,
    ctx.callbackQuery.message.message_id
  );
  if (getRefType(fileid, text) === "n") {
    /**
     * @type {import("telegraf/types").Convenience.ExtraDocument}
     */
    let extra = {
      caption: text,
      caption_entities: entities,
    };
    if (InlineKeyboard)
      extra.reply_markup = { inline_keyboard: InlineKeyboard };

    await ctx.replyWithDocument(fileid, extra);
  } else {
    /**
     * @type {import("telegraf/types").Convenience.ExtraReplyMessage}
     */
    let extra = {
      entities: entities,
      disable_web_page_preview: true,
    };
    if (InlineKeyboard)
      extra.reply_markup = { inline_keyboard: InlineKeyboard };
    if (fileid.length > 10) await ctx.replyWithDocument(fileid);
    await ctx.reply(text, extra);
  }
}

/**
 *
 * @param {string} text
 */
function getRefType(fileid, text) {
  if (text.length < 980 && fileid.endsWith("QQ")) return "n";
  return "mm";
}

/**
 *
 * @param {DB.User} user
 * @param {*} uOC
 * @returns
 */
function noCache(user, uOC) {
  return (
    !user?.cache?.sessionCache[0] || !uOC || !uOC[user?.cache?.sessionCache[0]]
  );
}

/**
 *
 * @param {Context} ctx
 */
function noOC(ctx) {
  ctx.answerCbQuery("Нету ОС!", { show_alert: true });
}

/*
|--------------------------------------------------------------------------
| Menu
|--------------------------------------------------------------------------
|  
| 
|
|
| 
| 
*/
// @ts-ignore
const MENU = {
  MyOC: [
    // Главное меню > Мои персонажи
    new Query(
      {
        name: "my",
        prefix: "OC",
      },
      async (ctx) => {
        const OCS = await getOCS(),
          q = ctx.callbackQuery;
        if (!OCS[q.from.id]?.map) return noOC(ctx);

        const btns = [],
          userOCS = OCS[q.from.id],
          menu = [new Button("↩️").data(link("back"))];
        for (const [i, e] of userOCS.entries()) {
          if (e)
            btns.push([
              new Button(e.name).data(
                link("myoc", q.from.id, i, q.from.username)
              ),
            ]);
        }
        btns.push(menu);

        ctx.answerCbQuery("Ваши персонажи");
        editMsg(ctx, lang.myOCS, {
          reply_markup: { inline_keyboard: btns },
        });
      }
    ),

    // Главное меню > Мои персонажи > |Персонаж|
    new Query(
      {
        name: "myoc",
        prefix: "OC",
      },
      async (ctx, data) => {
        const OCS = await getOCS();
        if (!OCS[data[0]]?.map || !OCS[data[0]][data[1]]) return noOC(ctx);

        const OC = OCS[data[0]][data[1]],
          capt = lang.myOC(OC.name, OC.description, data[2]),
          refType = getRefType(OC.fileid, capt._text);

        ctx.answerCbQuery(OC.name);
        sendRef(ctx, OC.fileid, capt._text, capt._entities, [
          [new Button("Изменить").data(link("redact", data[1], data[2]))],
          [new Button("Удалить").data(link("del", data[1], refType))],
          [new Button("↩️").data(link("backdoc", refType))],
        ]);
      }
    ),

    new Query(
      {
        name: "del",
        prefix: "OC",
        message: "Персонаж удален",
      },
      async (ctx, data) => {
        delOC(ctx.callbackQuery.from.id, Number(data[0]));
        await ctx.telegram.deleteMessage(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id
        );
        if (data[1] === "mm")
          await ctx.telegram.deleteMessage(
            ctx.callbackQuery.message.chat.id,
            ctx.callbackQuery.message.message_id - 1
          );
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
          ssn.OC.enter(ctx.callbackQuery.from.id, 10, [data[0]], true);
          ctx.reply(...lang.red0._Build({ disable_web_page_preview: true }));
        }
      ),

      /*---------------------------------------------------
      //                  1 этап, фото
      ----------------------------------------------------*/
      new EventListener("document", 0, async (ctx, next, ow) => {
        if (not(ctx, await ssn.OC.Q(ctx.from.id, true, ow.DBUser), 10))
          return next();
        // @ts-ignore
        ssn.OC.enter(ctx.from.id, 11, ctx.message.document.file_id);
        ctx.reply(lang.redact.name());
        console.log(
          `> OC. [${
            format.getName(ctx.from) ?? ctx.from.id
          }] redacted reference`
        );
      }),

      ssn.OC.next(10, async (ctx, user) => {
        const OCS = await getOCS(),
          uOC = OCS[ctx.from.id];
        if (noCache(user, uOC)) return err(421, ctx);

        const oc = uOC[user.cache.sessionCache[0]];
        ssn.OC.enter(ctx.from.id, 11, oc.fileid);
        ctx.reply(lang.redact.name());
        console.log(
          `> OC. [${format.getName(ctx.from) ?? ctx.from.id}] skipped reference`
        );
      }),
      /*---------------------------------------------------
      

      ---------------------------------------------------
      //                  2 этап, имя
      ----------------------------------------------------*/
      new EventListener("text", 0, async (ctx, next, ow) => {
        const qq = await ssn.OC.Q(ctx.from.id, true, ow.DBUser);
        if (not(ctx, qq, 11)) return next();
        if (cacheEmpty(qq)) return err(421, ctx);

        if (ctx.message.text.length > 32)
          return ctx.reply(...lang.maxLength("Имя", 32));

        ssn.OC.enter(ctx.from.id, 12, ctx.message.text);
        ctx.reply(lang.redact.description());
        console.log(
          `> OC. [${format.getName(ctx.from) ?? ctx.from.id}] redacted name`
        );
      }),

      ssn.OC.next(11, async (ctx, user) => {
        const OCS = await getOCS(),
          uOC = OCS[ctx.from.id];
        if (noCache(user, uOC)) return err(421, ctx);
        const oc = uOC[user?.cache?.sessionCache[0]];
        ssn.OC.enter(ctx.from.id, 12, oc.name);
        ctx.reply(lang.redact.description());
        console.log(
          `> OC. [${format.getName(ctx.from) ?? ctx.from.id}] skipped name`
        );
      }),
      /*---------------------------------------------------
      

      ---------------------------------------------------
      //                  3 этап, описание
      ----------------------------------------------------*/
      new EventListener("text", 0, async (ctx, next, ow) => {
        const qq = await ssn.OC.Q(ctx.from.id, true, ow.DBUser);
        if (not(ctx, qq, 12)) return next();
        if (cacheEmpty(qq, 1)) return err(421, ctx);
        if (ctx.message.text.length > 4000)
          return ctx.reply(...lang.maxLength("Описание", 4000));

        saveOC(
          ctx.from.id,
          {
            // @ts-ignore
            name: qq.user.cache.sessionCache[2],
            // @ts-ignore
            fileid: qq.user.cache.sessionCache[1],
            description: ctx.message.text,
          },
          // @ts-ignore
          qq.user.cache.sessionCache[0]
        );
        ssn.OC.exit(ctx.from.id);
        ctx.reply(lang.create.done);
      }),

      ssn.OC.next(12, async (ctx, user) => {
        const OCS = await getOCS(),
          uOC = OCS[ctx.from.id];
        if (noCache(user, uOC)) return err(422, ctx);

        const oc = uOC[user.cache.sessionCache[0]];

        saveOC(
          ctx.from.id,
          {
            name: user.cache.sessionCache[2],
            fileid: user.cache.sessionCache[1],
            description: oc.description,
          },
          Number(user.cache.sessionCache[0])
        );
        ssn.OC.exit(ctx.from.id);
        ctx.reply(lang.create.done);
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
      async (ctx, data) => {
        if (_data.isDev) editMsg(ctx, "Загрузка...");
        const OCS = await getOCS(),
          keys = Object.keys(OCS);
        if (!keys[0]) {
          editMsg(ctx, lang.main._text, {
            entities: lang.main._entities,
            reply_markup: {
              inline_keyboard: lang.mainKeyboard,
            },
            disable_web_page_preview: true,
          });
          return noOC(ctx);
        }
        let btns = [],
          page = Number(data[0]) !== 0 ? Number(data[0]) : 1;
        for (const e of keys.sort()) {
          try {
            /**
             * @type {DB.User}
             */
            const user = await database.get(d.user(e), true),
              u =
                user?.cache?.nickname ??
                user?.static?.name ??
                user?.static?.nickname;
            if (u)
              btns.push([
                new Button(format.capitalizeFirstLetter(u)).data(
                  link(
                    "uOC",
                    e,
                    page,
                    format.capitalizeFirstLetter(u),
                    user?.static?.nickname
                  )
                ),
              ]);
          } catch (e) {}
        }
        btns = m.generatePageSwitcher(
          btns,
          new Button(m.config.backButtonSymbol).data(link("back")),
          "find",
          page
        );

        editMsg(ctx, lang.find, {
          reply_markup: { inline_keyboard: btns },
        });
      }
    ),

    new Query(
      {
        name: "uOC",
        prefix: "OC",
      },
      async (ctx, data) => {
        const OCS = await getOCS();
        if (!OCS[data[0]]?.map) return noOC(ctx);

        const btns = [],
          userOCS = OCS[data[0]] ?? [],
          menu = [new Button("↩️").data(link("find", data[1]))];
        for (const [i, e] of userOCS.entries()) {
          if (e)
            btns.push([
              new Button(e.name).data(link("oc", data[0], i, data[2], data[3])),
            ]);
        }
        btns.push(menu);

        ctx.answerCbQuery("ОС " + data[2]);
        if (!data[4])
          editMsg(ctx, lang.userOCS(data[2]), {
            reply_markup: { inline_keyboard: btns },
          });
        else sendMsgDelDoc(ctx, lang.userOCS(data[2]), null, btns, data[4]);
      }
    ),

    new Query(
      {
        name: "oc",
        prefix: "OC",
      },
      async (ctx, data) => {
        const OCS = await getOCS();
        if (!data[1] || !OCS[data[0]]?.map || !OCS[data[0]][data[1]])
          return noOC(ctx);

        const OC = OCS[data[0]][data[1]],
          capt = lang.OC(OC.name, OC.description, data[2], data[3]),
          refType = getRefType(OC.fileid, capt._text);

        ctx.answerCbQuery(OC.name);
        sendRef(ctx, OC.fileid, capt._text, capt._entities, [
          [
            new Button("↩️↩️").data(link("backdoc", refType)),
            new Button("↩️").data(link("uOC", ...data, refType)),
          ],
        ]);
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
        ctx.reply(...lang.reg0._Build({ disable_web_page_preview: true }));
      }
    ),

    // 1 этап, фото
    new EventListener("document", 0, async (ctx, next, ow) => {
      if (not(ctx, await ssn.OC.Q(ctx.from.id, true, ow.DBUser), 0))
        return next();
      ssn.OC.enter(ctx.from.id, 1, [ctx.message.document.file_id], true);
      ctx.reply(lang.create.name);
      console.log(
        `> OC. [${format.getName(ctx.from) ?? ctx.from.id}] sended reference`
      );
    }),

    // 2 этап, имя
    new EventListener("text", 0, async (ctx, next, ow) => {
      const qq = await ssn.OC.Q(ctx.from.id, true, ow.DBUser);
      if (not(ctx, qq, 1)) return next();
      if (cacheEmpty(qq)) return err(420, ctx);
      if (ctx.message.text.length > 32)
        return ctx.reply(...lang.maxLength("Имя", 32));

      ssn.OC.enter(ctx.from.id, 2, ctx.message.text);
      ctx.reply(lang.create.description);
      console.log(
        `> OC. [${format.getName(ctx.from) ?? ctx.from.id}] sended name`
      );
    }),

    // 3 этап - описание
    new EventListener("text", 0, async (ctx, next, ow) => {
      const qq = await ssn.OC.Q(ctx.from.id, true, ow.DBUser);
      if (not(ctx, qq, 2)) return next();
      if (cacheEmpty(qq, 1)) return err(420, ctx);
      if (ctx.message.text.length > 4000)
        return ctx.reply(...lang.maxLength("Описание", 4000));

      saveOC(ctx.from.id, {
        // @ts-ignore
        name: qq.user.cache.sessionCache[1],
        // @ts-ignore
        fileid: qq.user.cache.sessionCache[0],
        description: ctx.message.text,
      });
      ssn.OC.exit(ctx.from.id);
      ctx.reply(lang.create.done);
    }),
  ],
  MainMenu: [
    new Command(
      {
        name: "oc",
        description: "Все действия с OC",
        permisson: 0,
        type: "private",
      },
      (ctx) => {
        ctx.reply(
          ...lang.main
            .InlineKeyboard(...lang.mainKeyboard)
            ._Build({ disable_web_page_preview: true })
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
        editMsg(ctx, lang.main._text, {
          entities: lang.main._entities,
          reply_markup: {
            inline_keyboard: lang.mainKeyboard,
          },
          disable_web_page_preview: true,
        });
      }
    ),
    new Query(
      {
        name: "backdoc",
        prefix: "OC",
        message: "Назад",
      },
      (ctx, data) => {
        sendMsgDelDoc(
          ctx,
          lang.main._text,
          lang.main._entities,
          lang.mainKeyboard,
          data[0]
        );
      }
    ),
  ],
};