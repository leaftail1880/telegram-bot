import { DatabaseWrapper } from "leafy-db";
import { Context } from "telegraf";
import { DBManager, newlog } from "../../index.js";
import { Xitext } from "../../lib/Class/Xitext.js";

/** @typedef {{ name: string; fileid: string; description: string }} Character */

/**
 * @type {DatabaseWrapper<Character[]>}
 */
export const OC_DB = DBManager.CreateTable("modules/oc.json");

OC_DB._.beforeGet = (key, value) => (Array.isArray(value) ? value : []);
OC_DB._.beforeSet = (key, value) => (value.length > 0 ? value : "");

/**
 *
 * @param {string} message
 */
export function oclog(message) {
	newlog({
		fileMessage: message,
		consoleMessage: message,
		text: new Xitext().text(message),
	});
}

/**
 *
 * @param {number} id
 * @param {Character} oc
 * @param {number} [index]
 */
export async function saveOC(id, oc, index) {
	const { data: OCs, save } = OC_DB.work(id);
	index ? (OCs[index] = oc) : OCs.push(oc);
	save();

	oclog(`> OC. ${index ? "Изменен" : "Создан новый"} ОС. Имя: ${oc.name}`);
}

/**
 *
 * @param {number} id
 * @param {number} index
 */
export function deleteOC(id, index) {
	const { data: OCs, save } = OC_DB.work(id);
	OCs.splice(index, 1);
	save();

	oclog(`> OC. Удален ОС. Имя: ${OCs[index]?.name}`);
}

/**
 *
 * @param {Context} ctx
 * @param {string} text
 * @param {Array<Array<import("telegraf/types").InlineKeyboardButton>>} InlineKeyboard
 */
export async function sendMessagDeleteRef(ctx, text, entities, InlineKeyboard, delType) {
	/**
	 * @type {import("telegraf/types").Convenience.ExtraReplyMessage}
	 */
	let extra = {
		disable_web_page_preview: true,
	};
	if (entities) extra.entities = entities;
	if (InlineKeyboard) extra.reply_markup = { inline_keyboard: InlineKeyboard };

	try {
		await ctx.telegram.deleteMessage(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id);
	} catch {}

	if (delType === "2")
		await ctx.telegram.deleteMessage(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id - 1);

	await ctx.reply(text, extra);
}

/**
 *
 * @param {Context} ctx
 * @param {string} text
 * @param {string} fileid
 * @param {Array<Array<import("telegraf/types").InlineKeyboardButton>>} InlineKeyboard
 */
export async function sendRef(ctx, fileid, text, entities, InlineKeyboard) {
	await ctx.telegram.deleteMessage(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id);
	if (getRefType(fileid, text) === "1") {
		/**
		 * @type {import("telegraf/types").Convenience.ExtraDocument}
		 */
		let extra = {
			caption: text,
			caption_entities: entities,
		};
		if (InlineKeyboard) extra.reply_markup = { inline_keyboard: InlineKeyboard };

		await ctx.replyWithDocument(fileid, extra);
	} else {
		/**
		 * @type {import("telegraf/types").Convenience.ExtraReplyMessage}
		 */
		let extra = {
			entities: entities,
			disable_web_page_preview: true,
		};
		if (InlineKeyboard) extra.reply_markup = { inline_keyboard: InlineKeyboard };
		if (fileid.length > 10) await ctx.replyWithDocument(fileid);
		await ctx.reply(text, extra);
	}
}

/**
 *
 * @param {string} text
 * @param {string} fileid
 */
export function getRefType(fileid, text) {
	if (text.length > 980) return "2";
	return "1";
}

/**
 *
 * @param {DB.User} user
 * @param {*} uOC
 * @returns
 */
export function noCache(user, uOC) {
	return !user?.cache?.sceneCache[0] || !uOC || !uOC[user?.cache?.sceneCache[0]];
}

/**
 *
 * @param {Context} ctx
 */
export function noOC(ctx) {
	ctx.answerCbQuery("Нету ОС!", { show_alert: true });
}
