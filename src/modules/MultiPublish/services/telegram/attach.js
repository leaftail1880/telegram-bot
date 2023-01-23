import { bot } from "../../../../index.js";
import { u } from "../../../../lib/Class/Utils.js";
import { Xitext } from "../../../../lib/Class/Xitext.js";
import { ART } from "../../index.js";
import { getUserArtInfo, setUserArtInfo } from "../../utils.js";

let attach_url = "";

void (async function main() {
	const me = await bot.telegram.getMe();
	attach_url = `http://t.me/${me.username}?startchannel&admin=post_messages+delete_messages`;
})();

/** @type {Record<string, {id: number; message_id: number}>} */
const active_attaches = {};

/**
 *
 * @param {number} id
 * @returns
 */
const genCode = (id) => `КобольдяConnect::${id.toString(32)}`;

/** @type {import("../../types.js").AttachFunction} */
export async function attach(ctx) {
	const xt = new Xitext();

	const code = genCode(ctx.from.id);

	xt.bold("Для подключения телеграм канала нужно выполнить следующие шаги:\n")

		.text("\n1) Нажми на ")
		.url("ссылку", attach_url)
		.text(" и выбери свой арт-канал")

		.text("\n2) Скопируй этот код нажав на него: ")
		.mono(code)

		.text("\n3) Сделай ")
		.url("беззвучный пост", u.guide(20))
		.text(
			" со скопированным кодом в арт канале, куда был добавлен бот. Если все сделано верно, бот тут же удалит пост и привяжет канал."
		);
	const message = await ctx.reply(...xt._.build());

	active_attaches[code] = { id: ctx.from.id, message_id: message.message_id };
}

bot.on("channel_post", async (ctx) => {
	if (!("text" in ctx.channelPost)) return;
	const code = ctx.channelPost.text;
	const attach_info = active_attaches[code];
	if (!attach_info) return;

	const sender_id = attach_info.id;
	ctx.deleteMessage(ctx.channelPost.message_id);
	ctx.telegram.deleteMessage(sender_id, attach_info.message_id);
	const userData = await getUserArtInfo(sender_id);
	userData.services.telegram.id = ctx.chat.id;
	userData.services.telegram.enabled = 1;
	await setUserArtInfo(sender_id, userData);
	ctx.telegram.sendMessage(sender_id, 'Телеграм канал "' + ctx.chat.title + '" успешно привязан.', {
		reply_markup: {
			inline_keyboard: ART.lang.main.__.inlineKeyboard,
		},
	});
});

/** @type {import("../../types.js").PostFunction} */
export function post(ctx) {
	ctx;
}
