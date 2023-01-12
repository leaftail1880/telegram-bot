import { EventListener } from "../../../lib/Class/Events.js";
import { Query } from "../../../lib/Class/Query.js";
import { ssn } from "../../../lib/Class/Stage.js";
import { util } from "../../../lib/Class/Utils.js";
import { lang } from "../index.js";
import { oclog, saveOC } from "../utils.js";

new Query(
	{
		name: "reg",
		prefix: "OC",
		message: "Регистрация",
	},
	(ctx) => {
		ssn.OC.enter(ctx.callbackQuery.from.id, 0);
		ctx.reply(...lang.reg0._.build({ disable_web_page_preview: true }));
	}
);

// 1 этап, фото
EventListener("document", 0, async (ctx, next, data) => {
	if (ssn.OC.state(data) !== 0) return next();

	ssn.OC.enter(ctx.from.id, 1, [ctx.message.document.file_id], true);
	ctx.reply(lang.create.name);
	oclog(`> OC. ${util.getNameFromCache(ctx.from)} отравил(а) реф`);
});

// 2 этап, имя
EventListener("text", 0, async (ctx, next, data) => {
	if (ssn.OC.state(data) !== 1) return next();
	if (ctx.message.text.length > 32) return ctx.reply(...lang.maxLength("Имя", 32));

	ssn.OC.enter(ctx.from.id, 2, ctx.message.text);
	ctx.reply(lang.create.description);
	oclog(`> OC. ${util.getNameFromCache(ctx.from)} отправил(а) имя`);
});

// 3 этап - описание
EventListener("text", 0, async (ctx, next, data) => {
	if (ssn.OC.state(data) !== 2) return next();
	if (ctx.message.text.length > 4000) return ctx.reply(...lang.maxLength("Описание", 4000));

	saveOC(ctx.from.id, {
		name: data.user.cache.stageCache[1],
		fileid: data.user.cache.stageCache[0],
		description: ctx.message.text,
	});

	ssn.OC.exit(ctx.from.id);
	ctx.reply(lang.create.done);
});
