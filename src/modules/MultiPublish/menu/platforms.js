import { Xitext } from "../../../lib/Class/Xitext.js";
import { ART } from "../index.js";
import { artButton, artMenu, getUserArtInfo, setUserArtInfo } from "../utils.js";

const names = {
	telegram: "Телеграм канал",
	vk: "Вк сообщество",
	twitter: "Twitter",
	furaffinity: "Furaffinity",
};

const StatusesEnum = {
	enabled: 2,
	disabled: 1,
	not_connected: 0,
};

const VisualStatusPrefix = {
	[StatusesEnum.enabled]: "+ ",
	[StatusesEnum.disabled]: "- ",
	[StatusesEnum.not_connected]: "Подключить ",
};

/** @type {Record<number, [string, string]>} */
const ManageStatus = {
	[StatusesEnum.enabled]: ["Включено", "Отключить"],
	[StatusesEnum.disabled]: ["Отключено", "Включить"],
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
async function genPlatformsMenu(id) {
	const userData = await getUserArtInfo(id);
	const buttons = [];
	const xt = new Xitext().text("Доступные платформы (Соц-сети):");

	for (const platform of ART.platfroms) {
		/** @type {import("../types/Integrations.js").ArtService & {token: string; id: string }} */
		const state = userData.services[platform];

		const { enabled, disabled, not_connected } = StatusesEnum;

		const status = state.enabled
			? enabled
			: // State has connect data but disabled manually
			has(state, "token") && has(state, "id")
			? disabled
			: not_connected;

		const visual_status = VisualStatusPrefix[status];

		buttons.push([artButton(`${visual_status}${names[platform]}`, "platform", platform, status + "")]);
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
		edit(...(await genPlatformsMenu(ctx.from.id))._.build());
	}
);

/**
 *
 * @param {string | number} id
 * @param {string} platform
 * @param {number} status_num
 */
async function genPlatformMenu(id, platform, status_num) {
	const [status, action] = ManageStatus[status_num];

	const xt = new Xitext().text(`Статус: ${status}`);

	xt.inlineKeyboard(
		[artButton(action, "status", platform)],
		[artButton("Удалить", "delete", platform)],
		[artButton(artMenu.config.backButtonSymbol + " Назад", "platforms")]
	);

	return xt;
}

artMenu.query(
	{
		name: "platform",
	},
	async (ctx, path, edit) => {
		const [platform, raw_status] = path;
		const status = parseInt(raw_status);
		if (status === StatusesEnum.not_connected) {
			ctx.deleteMessage(ctx.callbackQuery.message.message_id);
			ART.platformActions[platform].attach(ctx);
		} else {
			edit(...(await genPlatformMenu(ctx.from.id, platform, status))._.build());
		}
	}
);

artMenu.query(
	{
		name: "status",
	},
	async (ctx, path, edit) => {
		const [platform] = path;
		const userData = await getUserArtInfo(ctx.from.id);
		const cur_status = userData.services[platform].enabled;
		const status = cur_status === StatusesEnum.enabled ? StatusesEnum.disabled : StatusesEnum.enabled;

		userData.services[platform].enabled = status;
		setUserArtInfo(ctx.from.id, userData);
		edit(...(await genPlatformMenu(ctx.from.id, platform, cur_status))._.build());
	}
);

artMenu.query(
	{
		name: "delete",
	},
	async (ctx, path, edit) => {
		const userData = await getUserArtInfo(ctx.from.id);
		delete userData.services[path[0]];
		setUserArtInfo(ctx.from.id, userData);
		edit(...(await genPlatformsMenu(ctx.from.id))._.build());
	}
);
