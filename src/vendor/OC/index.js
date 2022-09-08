import { Context } from "telegraf";
import { cmd } from "../../app/class/cmdCLS.js";
import { d, format } from "../../app/class/formatterCLS.js";
import { Query } from "../../app/class/queryCLS.js";
import { ssn } from "../../app/class/sessionCLS.js";
import { Button, Xitext } from "../../app/class/XitextCLS.js";
import { err } from "../../app/functions/errFNC.js";
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

/*------------------------------------------ ЯЗЫК ------------------------------------------*/
const lang = {
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
    .Url(null, "https://t.me/xillerbotguides/6")
    .Text(" (Или гифтменю):"),
  reg0: new Xitext()
    .Text(
      "Что бы прикрепить своего ОС к этому боту, отправь референс ОС ввиде "
    )
    ._Group("файла")
    .Bold()
    .Url(null, "https://t.me/xillerbotguides/5")
    ._Group()
    .Text("\n Что бы выйти из этого пошагового меню используй команду /cancel"),
  red0: new Xitext()
    .Text("Отправь новый референс персонажа ввиде ")
    ._Group("файла")
    .Bold()
    .Url(null, "https://t.me/xillerbotguides/5")
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
 * @returns {Object}
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
 * @param {Number} id
 * @param {UserOC} oc
 * @param {Object} OCS
 * @param {Number} index
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
 * @param {Number} id
 * @param {UserOC} oc
 * @param {Object} OCS
 * @param {Number} index
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
 * @param {String} method
 * @param  {...String} args
 * @returns {String}
 */
function link(method, ...args) {
  return d.query("OC", method, ...args);
}

/**
 *
 * @param {Context} ctx
 * @param {String} text
 * @param {import("telegraf/typings/telegram-types.js").ExtraEditMessageText} extra
 * @param {Array<Array<import("telegraf/typings/core/types/typegram.js").InlineKeyboardButton>>} InlineKeyboard
 */
async function editMsg(ctx, text, extra, InlineKeyboard) {
  if (typeof extra === "object" && InlineKeyboard)
    extra.reply_markup.inline_keyboard = InlineKeyboard;
  await ctx.telegram.editMessageText(
    ctx.callbackQuery.message.chat.id,
    ctx.callbackQuery.message.message_id,
    ctx.callbackQuery.inline_message_id,
    text,
    extra
  );
}

/**
 *
 * @param {Context} ctx
 * @param {String} text
 * @param {Array<Array<import("telegraf/typings/core/types/typegram.js").InlineKeyboardButton>>} InlineKeyboard
 */
async function sendMsgDelDoc(ctx, text, entities, InlineKeyboard) {
  /**
   * @type {import("telegraf/typings/telegram-types.js").ExtraReplyMessage}
   */
  let extra = {
    entities: entities,
    disable_web_page_preview: true,
  };
  if (InlineKeyboard) extra.reply_markup = { inline_keyboard: InlineKeyboard };

  await ctx.telegram.deleteMessage(
    ctx.callbackQuery.message.chat.id,
    ctx.callbackQuery.message.message_id
  );

  await ctx.reply(text, extra);
}

/**
 *
 * @param {Context} ctx
 * @param {String} text
 * @param {Array<Array<import("telegraf/typings/core/types/typegram.js").InlineKeyboardButton>>} InlineKeyboard
 */
async function sendRef(ctx, fileid, text, entities, InlineKeyboard) {
  await ctx.telegram.deleteMessage(
    ctx.callbackQuery.message.chat.id,
    ctx.callbackQuery.message.message_id
  );
  if (text.length < 980 && fileid.endsWith('QQ')) {
    /**
     * @type {import("telegraf/typings/telegram-types.js").ExtraDocument}
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
     * @type {import("telegraf/typings/telegram-types.js").ExtraReplyMessage}
     */
    let extra = {
      entities: entities,
      disable_web_page_preview: true
    };
    if (InlineKeyboard)
      extra.reply_markup = { inline_keyboard: InlineKeyboard };
    if (fileid.endsWith('QQ')) await ctx.replyWithDocument(fileid);
    await ctx.reply(text, extra);
  }
}

/**
 *
 * @param {Context} ctx
 * @param {*} qq
 * @param {Number} session
 * @returns
 */
function not(ctx, qq, session) {
  return ctx.chat.type != "private" || qq === "not" || qq.session != session;
}

/**
 *
 * @param {import("../../app/models.js").DBUser} user
 * @param {*} uOC
 * @returns
 */
function noCache(user, uOC) {
  return (
    !user?.cache?.sessionCache[1] || !uOC || !uOC[user?.cache?.sessionCache[0]]
  );
}

function cacheEmpty(qq, lvl = 0) {
  return (
    !qq?.user?.cache?.sessionCache?.map || !qq?.user?.cache?.sessionCache[lvl]
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
          capt = lang.myOC(OC.name, OC.description, data[2]);

        ctx.answerCbQuery(OC.name);
        sendRef(ctx, OC.fileid, capt._text, capt._entities, [
          [new Button("Изменить").data(link("redact", data[1], data[2]))],
          [new Button("Удалить").data(link("del", data[1]))],
          [new Button("↩️").data(link("backdoc"))],
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
        delOC(ctx.callbackQuery.from.id, data[0]);
        await ctx.telegram.deleteMessage(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id
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
          ssn.OC.enter(ctx.callbackQuery.from.id, 10, [data[0], data[1]], true);
          ctx.reply(...lang.red0._Build({ disable_web_page_preview: true }));
        }
      ),

      /*---------------------------------------------------
      //                  1 этап, фото
      ----------------------------------------------------*/
      bot.on("document", async (ctx, next) => {
        if (not(ctx, await ssn.OC.Q(ctx.from.id, true), 10)) return next();
        ssn.OC.enter(ctx.from.id, 11, ctx.message.document.file_id);
        ctx.reply(lang.redact.name());
        console.log(`> OC. [${format.getName(ctx.from) ?? ctx.from.id}] redacted reference`)
      }),

      ssn.OC.next(10, async (ctx, user) => {
        const OCS = await getOCS(),
          uOC = OCS[ctx.from.id];
        if (noCache(user, uOC)) return err(421, ctx);

        const oc = uOC[user.cache.sessionCache[0]];
        ssn.OC.enter(ctx.from.id, 11, oc.fileid);
        ctx.reply(lang.redact.name());
        console.log(`> OC. [${format.getName(ctx.from) ?? ctx.from.id}] skipped reference`)
      }),
      /*---------------------------------------------------
      

      ---------------------------------------------------
      //                  2 этап, имя
      ----------------------------------------------------*/
      bot.on("text", async (ctx, next) => {
        const qq = await ssn.OC.Q(ctx.from.id, true);
        if (not(ctx, qq, 11)) return next();
        if (cacheEmpty(qq)) return err(421, ctx);

        if (ctx.message.text.length > 32)
          return ctx.reply(...lang.maxLength("Имя", 32));

        ssn.OC.enter(ctx.from.id, 12, ctx.message.text);
        ctx.reply(lang.redact.description());
        console.log(`> OC. [${format.getName(ctx.from) ?? ctx.from.id}] redacted name`)
      }),

      ssn.OC.next(11, async (ctx, user) => {
        const OCS = await getOCS(),
          uOC = OCS[ctx.from.id];
        if (noCache(user, uOC)) return err(421, ctx);
        const oc = uOC[user?.cache?.sessionCache[1]];
        ssn.OC.enter(ctx.from.id, 12, oc.description);
        ctx.reply(lang.redact.description());
        console.log(`> OC. [${format.getName(ctx.from) ?? ctx.from.id}] skipped name`)
      }),
      /*---------------------------------------------------
      

      ---------------------------------------------------
      //                  3 этап, описание
      ----------------------------------------------------*/
      bot.on("text", async (ctx, next) => {
        const qq = await ssn.OC.Q(ctx.from.id, true);
        if (not(ctx, qq, 12)) return next();
        if (cacheEmpty(qq, 1)) return err(421, ctx);
        if (ctx.message.text.length > 4000)
          return ctx.reply(...lang.maxLength("Описание", 4000));

        saveOC(
          ctx.from.id,
          {
            name: qq.user.cache.sessionCache[2],
            fileid: qq.user.cache.sessionCache[1],
            description: ctx.message.text,
          },
          qq.user.cache.sessionCache[0]
        );
        ssn.OC.exit(ctx.from.id);
        ctx.reply(lang.create.done);
      }),

      ssn.OC.next(12, async (ctx, user) => {
        const OCS = await getOCS(),
          uOC = OCS[ctx.from.id];
        if (noCache(user, uOC)) return err(ctx, 422);

        const oc = uOC[user?.cache?.sessionCache[1]];

        saveOC(
          ctx.from.id,
          {
            name: user.cache.sessionCache[3],
            fileid: user.cache.sessionCache[2],
            description: oc.description,
          },
          user.cache.sessionCache[1]
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
        const OCS = await getOCS(),
          keys = Object.keys(OCS);
        if (!keys[0]) return noOC(ctx);
        const btns = [],
          menu = [new Button("↩️").data(link("back"))],
          page = Number(data[0]) == NaN ? Number(data[0]) : 0;
        for (const e of keys) {
          try {
            const user = (await ctx.telegram.getChatMember(e, Number(e))).user,
              u = format.getName(user);
            if (u)
              btns.push([
                new Button(u).data(link("userOCs", e, page, u, user.username)),
              ]);
          } catch (e) {}
        }
        const qMax = Math.ceil(keys.length / maxButtonsRows) - 1,
          qNext = qMax >= page + 1;
        btns.splice(maxButtonsRows * page - page, maxButtonsRows * page);
        if (page > 0)
          menu.unshift(new Button("⏪").data(link("find", page - 1)));
        if (qNext) menu.push(new Button("⏩").data(link("find", page + 1)));
        btns.push(menu);

        editMsg(ctx, lang.find, {
          reply_markup: { inline_keyboard: btns },
        });
      }
    ),

    new Query(
      {
        name: "userOCs",
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
        editMsg(ctx, lang.userOCS(data[2]), {
          reply_markup: { inline_keyboard: btns },
        });
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
          capt = lang.OC(OC.name, OC.description, data[2], data[3]);

        ctx.answerCbQuery(OC.name);
        sendRef(ctx, OC.fileid, capt._text, capt._entities, [
          [new Button("↩️").data(link("backdoc"))],
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
    bot.on("document", async (ctx, next) => {
      if (not(ctx, await ssn.OC.Q(ctx.from.id, true), 0)) return next();
      ssn.OC.enter(ctx.from.id, 1, [ctx.message.document.file_id], true);
      ctx.reply(lang.create.name);
      console.log(`> OC. [${format.getName(ctx.from) ?? ctx.from.id}] sended reference`)
    }),

    // 2 этап, имя
    bot.on("text", async (ctx, next) => {
      const qq = await ssn.OC.Q(ctx.from.id, true);
      if (not(ctx, qq, 1)) return next();
      if (cacheEmpty(qq)) return err(420, ctx);
      if (ctx.message.text.length > 32)
        return ctx.reply(...lang.maxLength("Имя", 32));

      ssn.OC.enter(ctx.from.id, 2, ctx.message.text);
      ctx.reply(lang.create.description);
      console.log(`> OC. [${format.getName(ctx.from) ?? ctx.from.id}] sended name`)
    }),

    // 3 этап - описание
    bot.on("text", async (ctx, next) => {
      const qq = await ssn.OC.Q(ctx.from.id, true);
      if (not(ctx, qq, 2)) return next();
      if (cacheEmpty(qq, 1)) return err(420, ctx);
      if (ctx.message.text.length > 4000)
        return ctx.reply(...lang.maxLength("Описание", 4000));

      saveOC(ctx.from.id, {
        name: qq.user.cache.sessionCache[1],
        fileid: qq.user.cache.sessionCache[0],
        description: ctx.message.text,
      });
      ssn.OC.exit(ctx.from.id);
      ctx.reply(lang.create.done);
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
      (ctx) => {
        sendMsgDelDoc(
          ctx,
          lang.main._text,
          lang.main._entities,
          lang.mainKeyboard
        );
      }
    ),
  ],
};
