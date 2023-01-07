import { API, Upload } from "vk-io";
import { EventListener } from "../../../../lib/Class/Events.js";
import { Session } from "../../../../lib/Class/Session.js";
import { Xitext } from "../../../../lib/Class/Xitext.js";
import { env } from "../../../../lib/launch/tg.js";
import { ART } from "../../index.js";
import { getUserArtInfo, setUserArtInfo } from "../../utils.js";

const scopes = ["wall", "offline"];

const blank_uri = "https://oauth.vk.com/blank.html";

const attach_url = `https://oauth.vk.com/authorize?client_id=${
	env.VK_TOKEN
}&redirect_uri=${blank_uri}&scope=${scopes.join(",")}&response_type=token&v=5.131`;

const session = new Session("vk");

/** @type {import("../../types/Integrations.js").AttachFunction} */
export async function attach(ctx) {
	const xt = new Xitext();

	xt.bold("Для подключения вк сообщества нужно выполнить следующие шаги:\n")

		.text("\n1) Перейти по ")
		.url("ссылке", attach_url)
		.text(' и нажать "Разрешить"')

		.text(
			`\n2) После авторизации скопируй адрес страницы (что-то вроде ${blank_uri}...) и отправь боту. (И пусть там пишут что хотят, другого способа получить доступ к стене нет).`
		);

	ctx.reply(...xt._.build());

	session.enter(ctx.from.id, "connect token", {}, true);
}

EventListener("text", 0, (ctx, next, data) => {
	if (session.state(data, "string") !== "connect token") return next();

	const match = ctx.message.text.match(
		new RegExp(`^${blank_uri.replace("/", "\\/")}#access_token=(.+)&expires_in=0&user_id=\\d+`)
	);

	if (!match)
		ctx.reply(
			"Скопированный URL не соответствует паттерну. Мне нужна полная ссылка в формате " +
				blank_uri +
				"#acess_token=vk[XXXXX]&expires_in=0&user_id=[XXXXX]"
		);

	ctx.deleteMessage(ctx.message.message_id);

	ctx.reply(
		...new Xitext()
			.text("Токен добавлен успешно. Теперь пришли мне ")
			.url("ID группы", "https://vk.com/faq18062")
			.text(" (сообщества) вк, куда будут присылаться арты.")
			._.build()
	);

	session.enter(ctx.from.id, "connect group id", [match[1]], true);
});

EventListener("text", 0, async (ctx, next, data) => {
	if (session.state(data, "string") !== "connect group id") return next();

	const id = parseInt(ctx.message.text);

	if (isNaN(id)) return ctx.reply("Не удалось распознать ID. Пришли ID ввиде числа.");

	const token = data.user.cache.sessionCache[0];

	const userData = await getUserArtInfo(ctx.from.id);
	userData.services.vk.token = token;
	userData.services.vk.id = id;
	setUserArtInfo(ctx.from.id, userData);

	ctx.deleteMessage(ctx.message.message_id);

	ctx.reply('Группа "' + id + '" успешно привязана.', {
		reply_markup: {
			inline_keyboard: ART.lang.main.__.inlineKeyboard,
		},
	});

	session.exit(ctx.from.id);
});

/** @type {import("../../types/Integrations.js").PostFunction} */
export async function post(ctx) {
	const state = await getUserArtInfo(ctx.from.id);
	const service = state.services.vk;
	const upload = new Upload({
		api: new API({
			token: service.token,
			language: "ru",
		}),
	});

	await upload.wallPhoto({
		source: {
			value: "",
			uploadUrl: "",
		},
		group_id: service.id,
	});
}
