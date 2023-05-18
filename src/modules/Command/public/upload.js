import { upload } from "better-telegraph";
import { fmt, link } from "telegraf/format";
import { bot } from "../../../index.js";
import { Command } from "../../../lib/Class/Command.js";
import { hasDocument } from "../../../lib/Class/Filters.js";
import { Scene } from "../../../lib/Class/Scene.js";
import { u } from "../../../lib/Class/Utils.js";

const FILES = fmt`
Отправляй мне изображения ${link(
	"файлами",
	u.guide(5)
)}, а я буду создавать ссылки на них.

Как только закончишь, используй /cancel`;

const WRONG_TYPE = fmt`
Отправь ${link(
	"файл",
	u.guide(5)
)} с изображением, либо используй /cancel для выхода`;

new Command(
	{
		name: "upload",
		description: "Создает ссылку на файл",
		target: "private",
	},
	(ctx) => {
		SCENE.enter(ctx.from.id);
		ctx.reply(FILES, { disable_web_page_preview: true });
	}
);

const SCENE = new Scene("загрузка файла", async (ctx) => {
	if (!hasDocument(ctx))
		return ctx.reply(WRONG_TYPE, { disable_web_page_preview: true });
	const message = await ctx.reply("Загрузка началась...");
	const progress = (/** @type {string} */ m) => ctx.telegram.editMessageText(ctx.chat.id, message.message_id, null, m);

	const telegram_link = (await bot.telegram.getFileLink(ctx.message.document.file_id)).toString();
	const ref_link = await upload(telegram_link);
	await progress(ref_link);
});
