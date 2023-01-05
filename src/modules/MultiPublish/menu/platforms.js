import { Xitext } from "../../../lib/Class/Xitext.js";
import { artPlatforms } from "../index.js";
import { artButton, artMenu, getUserArtInfo } from "../utils.js";

const names = {
	telegram: "Телеграм канал",
	vk: "Вк сообщество",
	twitter: "Twitter",
	furaffinity: "Furaffinity",
};

/**
 *
 * @template {Object} O
 * @param {O} obj
 * @param {keyof O} key
 * @returns
 */
function has(obj, key) {
	// @ts-expect-error
	return !(key in obj) || !!obj[key];
}

/**
 *
 * @param {string | number} id
 */
async function genPlatforMenu(id) {
	const userData = await getUserArtInfo(id);
	const buttons = [];
	const xt = new Xitext().text("Доступные платформы (Соц-сети):");

	for (const platform of artPlatforms) {
		/** @type {import("../types/Integrations.js").ArtService & {token: string; id: string }} */
		const state = userData.services[platform];

		const status = state.enabled ? "> " : has(state, "token") && has(state, "id") ? "(Откл) " : "Добавить ";

		buttons.push([artButton(`${status}${names[platform]}`, "platform", platform)]);
	}

	buttons.push([artButton(artMenu.config.backButtonSymbol + " Назад", "back")]);

	xt.inlineKeyboard(...buttons);

	return xt;
}

artMenu.query(
	{
		name: "platforms",
	},
	async (ctx, path, edit) => {
		edit(...(await genPlatforMenu(ctx.from.id))._.build());
	}
);
