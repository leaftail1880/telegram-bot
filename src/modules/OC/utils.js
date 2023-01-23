import { parseMarkdown, upload } from "better-telegraph";
import { DatabaseWrapper } from "leafy-db";
import { Context } from "telegraf";
import { bot, database, newlog } from "../../index.js";
import { getAccount } from "../../lib/Class/Telegraph.js";
import { util } from "../../lib/Class/Utils.js";
import { fmt } from "../../lib/Class/Xitext.js";

/**
 * @typedef {{
 *  name: string;
 *  description: string
 *  fileid: string;
 *  path?: string;
 *  filepath?: string;
 * }} Character
 */

/**
 * @typedef {NotOptional<Character>} StoredCharacter
 */

/**
 * @type {DatabaseWrapper<StoredCharacter[]>}
 */
export const OC_DB = database.CreateTable("modules/oc.json");

OC_DB._.on("beforeGet", (key, value) => (Array.isArray(value) ? value : []));

/**
 *
 * @param {import("telegraf/types").User | null} from
 * @param {string} message
 */
export function oclog(from, message) {
	message = `OC> ${from ? ` ${util.getName(null, from)}` : ""} ${message}`;
	newlog({
		fileMessage: message,
		consoleMessage: message,
		text: fmt(message),
	});
}

/**
 *
 * @param {import("telegraf/types").User} user
 * @param {{
 *  name: string;
 *  fileid: string;
 *  description?: string
 * }} OC
 * @param {(m: string) => any} [progress]
 * @param {number} [index]
 */
export async function saveOC(user, OC, progress = () => void 0, index) {
	const { data: OCs, save } = OC_DB.work(user.id);

	/** @type {StoredCharacter} */
	const saveOC = {};
	const prevOC = OCs[index];
	let ref_link;
	let prev_page_id;

	saveOC.name = OC.name;
	saveOC.description = OC.description;
	saveOC.fileid = OC.fileid;

	await progress("Получение аккаунта...");
	const telegraph = await getAccount(user.id);

	if (prevOC) {
		prev_page_id = prevOC.path;
		saveOC.path = prevOC.path;

		if (!("description" in OC)) saveOC.description = prevOC.description;
	}

	if (prevOC?.fileid === OC.fileid && prevOC.filepath) {
		// Files are same, dont need to upload, just copiying file link
		ref_link = prevOC.filepath;
	} else {
		// New file, uploading...
		await progress("Загрузка референса...");
		const telegram_link = (await bot.telegram.getFileLink(OC.fileid)).toString();
		ref_link = await upload(telegram_link);
	}
	saveOC.filepath = ref_link;

	await progress("Создание поста...");
	const Post = parseMarkdown(`![Референс](${ref_link} "Референс")\n${OC.description}`);

	if (prev_page_id) {
		// Page already exists, just edit it
		await telegraph.edit(prev_page_id, { content: Post });
	} else {
		// Creating new page...
		const page = await telegraph.create({ title: OC.name, content: Post });
		saveOC.path = page.path;
	}
	if (prevOC) OCs[index] = saveOC;
	else OCs.push(saveOC);
	save();

	progress("Готово! /oc");
	oclog(null, `${typeof index === "number" ? "Изменен" : "Создан новый"} персонаж. Имя: ${OC.name}`);
}

/**
 *
 * @param {number} id
 * @param {number} index
 */
export async function deleteOC(id, index) {
	const { data: OCs, save } = OC_DB.work(id);
	const ocToDel = OCs[index];
	const telegraph = await getAccount(id);
	telegraph.edit(ocToDel.path, { content: "Персонаж был удален." });
	OCs.splice(index, 1);
	save();

	oclog(null, `Удален персонаж. Имя: ${OCs[index]?.name}`);
}
/**
 *
 * @param {Context} ctx
 */
export function noOC(ctx) {
	ctx.answerCbQuery("Нету ОС!", { show_alert: true });
}
