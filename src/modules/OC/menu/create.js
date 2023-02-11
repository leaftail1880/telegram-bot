import { hasDocument, hasText } from "../../../lib/Class/Filters.js";
import { Query } from "../../../lib/Class/Query.js";
import { Scene } from "../../../lib/Class/Scene.js";
import { u } from "../../../lib/Class/Utils.js";
import { bold, fmt, link } from "../../../lib/Class/Xitext.js";
import { oc } from "../index.js";
import { CreateProgressManager, oclog, saveOC } from "../utils.js";

const create = {
	file: fmt`Отправь мне референс персонажа ввиде ${bold("", link("файла", u.guide(5)))}\nВыйти: /cancel`,

	name: "Теперь отправь мне имя персонажа.",

	description: "Отправь мне описание персонажа. Лучше всего то, что поможет придумать окружение на будущем гифте.",

	saving: "Сохраняю...",
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
 * @type {Scene<{file_id?: string; name?: string}>}
 */
const scene = new Scene(
	"создание персонажа",

	// 1 этап, фото
	(ctx, next) => {
		if (!hasDocument(ctx)) return next();

		ctx.reply(create.name);
		oclog(ctx.from, `отравил(а) реф`);

		ctx.scene.data.file_id = ctx.message.document.file_id;
		ctx.scene.next();
	},

	// 2 этап, имя
	(ctx, next) => {
		if (!hasText(ctx)) return next();
		if (ctx.message.text.length > 32) return ctx.reply(oc.maxLength("Имя", 32));

		ctx.reply(create.description);
		oclog(ctx.from, `отправил(а) имя (${ctx.message.text})`);

		ctx.scene.data.name = ctx.message.text;
		ctx.scene.next();
	},

	// 3 этап - описание
	async (ctx, next) => {
		if (!hasText(ctx)) return next();
		if (ctx.message.text.length > 4000) return ctx.reply(oc.maxLength("Описание", 4000));

		const data = ctx.scene.data;
		const progress = await CreateProgressManager(ctx, create.saving);

		saveOC(
			ctx.from,
			{
				name: data.name,
				fileid: data.file_id,
				description: ctx.message.text,
			},
			progress
		);

		ctx.scene.leave();
	}
);
