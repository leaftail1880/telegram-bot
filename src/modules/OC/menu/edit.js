import { hasDocument, hasText } from "../../../lib/Class/Filters.js";
import { Query } from "../../../lib/Class/Query.js";
import { Scene } from "../../../lib/Class/Scene.js";
import { u } from "../../../lib/Class/Utils.js";
import { bold, fmt, link } from "../../../lib/Class/Xitext.js";
import { lang } from "../index.js";
import { oclog, OC_DB, saveOC, CreateProgressManager} from "../utils.js";

const create = {
	file: fmt`Отправь мне референс персонажа ввиде ${bold(
		"",
		link("файла", u.guide(5))
	)}\nВыйти: /cancel\nОставить прежний референс: /next`,

	name: "Теперь отправь мне имя персонажа.\nОставить прошлое: /next",

	description:
		"Отправь мне описание персонажа. Лучше всего то, что поможет придумать окружение на будущем гифте.\nОставить прежнее: /next",

	saving: "Успешно сохранено! /oc",
};

new Query(
	{
		name: "edit",
		prefix: "OC",
		message: "Редактирование",
	},
	(ctx, data) => {
		scene.enter(ctx.from.id, "0", { i: parseInt(data[0]) });
		ctx.reply(create.file, { disable_web_page_preview: true });
	}
);

/**
 * @type {Scene<{fileid: string; i: number; description: string; name: string;}>}
 */
const scene = new Scene(
	"редактирование персонажа",
	/**
	 * Reference
	 */
	{
		async middleware(ctx, next) {
			if (!hasDocument(ctx)) return next();

			ctx.scene.data.fileid = ctx.message.document.file_id;
			ctx.reply(create.name);
			oclog(ctx.from, `изменил(а) реф`);

			ctx.scene.next();
		},
		next(ctx, _) {
			const oldoc = OC_DB.get(ctx.from.id)[ctx.scene.data.i];
			ctx.scene.data.fileid = oldoc.fileid;

			ctx.reply(create.name);
			oclog(ctx.from, `оставил(а) прежний реф`);

			ctx.scene.next();
		},
	},
	/**
	 * Name
	 */
	{
		async middleware(ctx, next) {
			if (!hasText(ctx)) return next();

			if (ctx.message.text.length > 32) return ctx.reply(lang.maxLength("Имя", 32));

			ctx.reply(create.description);
			oclog(ctx.from, `изменил(а) имя`);

			ctx.scene.data.name = ctx.message.text;
			ctx.scene.next();
		},
		next(ctx, _) {
			const oldoc = OC_DB.get(ctx.from.id)[ctx.scene.data.i];

			ctx.reply(create.description);
			oclog(ctx.from, `оставил(а) прежнее имя`);

			ctx.scene.data.name = oldoc.name;
			ctx.scene.next();
		},
	},
	/**
	 * Description
	 */
	{
		async middleware(ctx, next) {
			if (!hasText(ctx)) return next();
			if (ctx.message.text.length > 4000) return ctx.reply(lang.maxLength("Описание", 4000));

			const d = ctx.scene.data;
			const message = await ctx.reply(create.saving);
			const progress = (/** @type {string} */ m, /** @type {Extra} */extra = {}) =>
				ctx.telegram.editMessageText(ctx.chat.id, message.message_id, null, m, extra);

			saveOC(
				ctx.from,
				{
					name: d.name,
					fileid: d.fileid,
					description: ctx.message.text,
				},
				progress,
				d.i
			);
			ctx.scene.leave();
		},
		async next(ctx) {
			const d = ctx.scene.data;
			const oldoc = OC_DB.get(ctx.from.id)[d.i];
			const message = await ctx.reply(create.saving);
			const progress = (/** @type {string} */ m) =>
				ctx.telegram.editMessageText(ctx.chat.id, message.message_id, null, m);

			saveOC(
				ctx.from,
				{
					name: d.name,
					fileid: d.fileid,
					description: oldoc.description,
				},
				progress,
				d.i
			);
			ctx.scene.leave();
		},
	}
);
