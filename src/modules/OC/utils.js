import { Context } from "telegraf";
import { database } from "../../index.js";
import { d, util } from "../../lib/Class/Utils.js";
import { log } from "../../lib/SERVISE.js";

/** @typedef {{name:string;fileid:string;description:string}} Character */
/** @typedef {Character[]} OwnerCharacters */

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
 * @param {number | string} id
 * @returns {Promise<OwnerCharacters>}
 */
export async function getUserOCs(id) {
	const dbvalue = await database.get(d.pn("oc", id), true);
	return Array.isArray(dbvalue) ? dbvalue : [];
}

/**
 *
 * @param {number | string} id
 * @param {OwnerCharacters} ocs
 */
export async function saveUserOCs(id, ocs) {
	await database.set(d.pn("oc", id), ocs);
}

/**
 *
 * @param {number} id
 * @param {Character} oc
 * @param {number} [index]
 */
export async function saveOC(id, oc, index) {
	log(`> OC. ${index ? "Изменен" : "Создан новый"} ОС. Имя: ${oc.name}`);
	const OCs = await getUserOCs(id);
	index ? (OCs[index] = oc) : OCs.push(oc);
	saveUserOCs(id, OCs);
}

/**
 *
 * @param {number} id
 * @param {number} index
 */
export async function delOC(id, index) {
	const OCs = await getUserOCs(id);
	log(`> OC. Удален ОС. Имя: ${OCs[index]?.name}`);
	delete OCs[index];
	saveUserOCs(id, OCs);
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

	await ctx.telegram.deleteMessage(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id);
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
	return !user?.cache?.sessionCache[0] || !uOC || !uOC[user?.cache?.sessionCache[0]];
}

/**
 *
 * @param {Context} ctx
 */
export function noOC(ctx) {
	ctx.answerCbQuery("Нету ОС!", { show_alert: true });
}

/**
 *
 * @param {import("telegraf/types").User} user
 * @returns
 */
export function getNameFromCache(user) {
	return util.getFullName(database.collection()[d.user(user.id)], user);
}
