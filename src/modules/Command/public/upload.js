import { upload } from "better-telegraph";
import { fmt, link } from "telegraf/format";
import { message } from "../../../index.js";
import { Scene } from "../../../lib/scene.js";
import { u } from "../../../lib/utils/index.js";
import { Command } from "../../../lib/сommand.js";

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
	if (!message("document")(ctx.update))
		return ctx.reply(WRONG_TYPE, { disable_web_page_preview: true });

	const status = await ctx.reply("Загрузка началась...");
	const tgLink = await ctx.telegram.getFileLink(
		ctx.update.message.document.file_id
	);
	const thLink = await upload(tgLink.toString());
	ctx.telegram.editMessageText(ctx.chat.id, status.message_id, null, thLink);
});
