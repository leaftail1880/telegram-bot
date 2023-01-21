import { bot } from "../../../index.js";
import { hasDocument, hasText } from "../../../lib/Class/Filters.js";
import { Query } from "../../../lib/Class/Query.js";
import { Scene } from "../../../lib/Class/Scene.js";
import { d, util } from "../../../lib/Class/Utils.js";
import { bold, fmt, link } from "../../../lib/Class/Xitext.js";
import { lang, OC } from "../index.js";
import { oclog, saveOC } from "../utils.js";

const create = {
	file: fmt`Отправь мне референс персонажа ввиде ${bold(
		"",
		link("файла", d.guide(5))
	)}\n Что бы выйти, используй команду /cancel`,

	name: "Теперь отправь мне имя персонажа. (Не более 32 символов)",

	description:
		"Теперь отправь мне описание персонажа. (Ссылку на тг акк в нем оставлять не надо, я делаю это за вас при поиске))",

	done: "Успешно! /oc",
};

new Query(
	{
		name: "reg",
		prefix: "OC",
		message: "Создание",
	},
	(ctx) => {
		scene.enter(ctx.from.id);
		ctx.reply(create.file, { disable_web_page_preview: true });
	}
);

/**
 * @type {Scene<{file_id?: string; name?: string; desc?: string;}>}
 */
const scene = new Scene(
	"создание персонажа",

	// 1 этап, фото
	(ctx, next) => {
		if (!hasDocument(ctx)) return next();

		ctx.reply(create.name);
		oclog(`> OC. ${util.getNameFromCache(ctx.from)} отравил(а) реф`);

		ctx.scene.data.file_id = ctx.message.document.file_id;
		ctx.scene.next();
	},

	// 2 этап, имя
	(ctx, next) => {
		if (!hasText(ctx)) return next();
		if (ctx.message.text.length > 32) return ctx.reply(lang.maxLength("Имя", 32));

		ctx.scene.data.name = ctx.message.text;
		ctx.reply(create.description);
		oclog(`> OC. ${util.getNameFromCache(ctx.from)} отправил(а) имя`);
	},

	// 3 этап - описание
	(ctx, next) => {
		if (!hasText(ctx)) return next();
		if (ctx.message.text.length > 4000) return ctx.reply(lang.maxLength("Описание", 4000));

		const data = ctx.scene.data;
		saveOC(ctx.from.id, {
			name: data.name,
			fileid: data.file_id,
			description: data.name,
		});

		ctx.scene.leave();
		ctx.reply(create.done);
	}
);
