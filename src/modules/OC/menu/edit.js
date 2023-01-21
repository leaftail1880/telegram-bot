import { bot } from "../../../index.js";
import { Query } from "../../../lib/Class/Query.js";
import { Scene } from "../../../lib/Class/Scene.js";
import { util } from "../../../lib/Class/Utils.js";
import { err } from "../err.js";
import { lang, OC } from "../index.js";
import { noCache, oclog, OC_DB, saveOC } from "../utils.js";

new Query(
	{
		name: "edit",
		prefix: "OC",
		message: "Редактирование",
	},
	(ctx, data) => {
		OC.enter(ctx.callbackQuery.from.id, "edit-photo", [data[0]], true);
		ctx.reply(...lang.edit0._.build());
	}
);

/*---------------------------------------------------
//                  1 этап, фото
----------------------------------------------------*/
bot.on("message", async (ctx, next) => {
	if (!("document" in ctx.message)) return next();
	const data = ctx.data;
	if (OC.state(data) !== "edit-photo") return next();

	OC.enter(ctx.from.id, "edit-name", ctx.message.document.file_id);
	ctx.reply(lang.edit.name());
	oclog(`> OC. ${util.getNameFromCache(ctx.from)} изменил(а) реф`);
});

OC.next("edit-photo", async (ctx, user) => {
	const uOC = OC_DB.get(ctx.from.id);
	if (noCache(user, uOC)) return err(421, ctx);

	const oc = uOC[user.cache.sceneCache[0]];
	OC.enter(ctx.from.id, "edit-name", oc.fileid);
	ctx.reply(lang.edit.name());
	oclog(`> OC. ${util.getNameFromCache(ctx.from)} оставил(а) прежний реф`);
});
/*---------------------------------------------------


---------------------------------------------------
//                  2 этап, имя
----------------------------------------------------*/
bot.on("message", async (ctx, next) => {
	if (!("text" in ctx.message)) return next();
	const data = ctx.data;
	if (OC.state(data) !== "edit-description") return next();

	if (ctx.message.text.length > 32) return ctx.reply(lang.maxLength("Имя", 32));

	OC.enter(ctx.from.id, "edit-description", ctx.message.text);
	ctx.reply(lang.edit.description());
	oclog(`> OC. ${util.getNameFromCache(ctx.from)} изменил(а) имя`);
});

OC.next("edit-name", async (ctx, user) => {
	const uOC = OC_DB.get(ctx.from.id);
	if (noCache(user, uOC)) return err(421, ctx);

	const oc = uOC[user?.cache?.sceneCache[0]];
	OC.enter(ctx.from.id, "edit-description", oc.name);
	ctx.reply(lang.edit.description());
	oclog(`> OC. ${util.getNameFromCache(ctx.from)} оставил(а) прежнее имя`);
});
/*---------------------------------------------------


---------------------------------------------------
//                  3 этап, описание
----------------------------------------------------*/
bot.on("message", async (ctx, next) => {
	if (!("text" in ctx.message)) return next();
	const data = ctx.data;
	if (OC.state(data) !== "edit-description") return next();

	if (ctx.message.text.length > 4000) return ctx.reply(lang.maxLength("Описание", 4000));

	saveOC(
		ctx.from.id,
		{
			name: data.user.cache.sceneCache[2],
			fileid: data.user.cache.sceneCache[1],
			description: ctx.message.text,
		},
		parseInt(data.user.cache.sceneCache[0])
	);
	OC.exit(ctx.from.id);
	ctx.reply(lang.create.done);
});

OC.next("edit-description", async (ctx, user) => {
	const uOC = OC_DB.get(ctx.from.id);
	if (noCache(user, uOC)) return err(421, ctx);

	const oc = uOC[user?.cache?.sceneCache[0]];

	saveOC(
		ctx.from.id,
		{
			name: user.cache.sceneCache[2],
			fileid: user.cache.sceneCache[1],
			description: oc.description,
		},
		Number(user.cache.sceneCache[0])
	);
	OC.exit(ctx.from.id);
	ctx.reply(lang.create.done);
});
