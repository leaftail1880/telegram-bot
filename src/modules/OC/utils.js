import { Context } from "telegraf";
import { d } from "../../lib/Class/Formatter.js";
import { database } from "../../index.js";

/**
 * @returns {Promise<Object>}
 */
export async function getOCS() {
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
 * @param {userOC} oc
 * @param {number} [index]
 */
export async function saveOC(id, oc, index) {
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
export async function delOC(id, index) {
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
export async function sendMsgDelDoc(
  ctx,
  text,
  entities,
  InlineKeyboard,
  delType
) {
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
export async function sendRef(ctx, fileid, text, entities, InlineKeyboard) {
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
export function getRefType(fileid, text) {
  if (text.length < 980 && fileid.length > 5) return "n";
  return "mm";
}

/**
 *
 * @param {DB.User} user
 * @param {*} uOC
 * @returns
 */
export function noCache(user, uOC) {
  return (
    !user?.cache?.sessionCache[0] || !uOC || !uOC[user?.cache?.sessionCache[0]]
  );
}

/**
 *
 * @param {Context} ctx
 */
export function noOC(ctx) {
  ctx.answerCbQuery("Нету ОС!", { show_alert: true });
}