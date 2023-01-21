import { bot } from "../../../index.js";
import { Query } from "../../../lib/Class/Query.js";
import { ssn } from "../../../lib/Class/Scene.js";
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
		ctx.reply(...lang.reg0._.build());
	}
);

// 1 этап, фото
bot.on("message", async (ctx, next) => {
	if (!("document" in ctx.message)) return next();
	const data = ctx.data;
	if (ssn.OC.state(data) !== 0) return next();

	ssn.OC.enter(ctx.from.id, 1, [ctx.message.document.file_id], true);
	ctx.reply(lang.create.name);
	oclog(`> OC. ${util.getNameFromCache(ctx.from)} отравил(а) реф`);
});

// 2 этап, имя
bot.on("message", async (ctx, next) => {
	if (!("text" in ctx.message)) return next();
	const data = ctx.data;

	if (ssn.OC.state(data) !== 1) return next();
	if (ctx.message.text.length > 32) return ctx.reply(...lang.maxLength("Имя", 32));

	ssn.OC.enter(ctx.from.id, 2, ctx.message.text);
	ctx.reply(lang.create.description);
	oclog(`> OC. ${util.getNameFromCache(ctx.from)} отправил(а) имя`);
});

// 3 этап - описание
bot.on("message", async (ctx, next) => {
	if (!("text" in ctx.message)) return next();
	const data = ctx.data;

	if (ssn.OC.state(data) !== 2) return next();
	if (ctx.message.text.length > 4000) return ctx.reply(...lang.maxLength("Описание", 4000));

	saveOC(ctx.from.id, {
		name: data.user.cache.sceneCache[1],
		fileid: data.user.cache.sceneCache[0],
		description: ctx.message.text,
	});

	ssn.OC.exit(ctx.from.id);
	ctx.reply(lang.create.done);
});
