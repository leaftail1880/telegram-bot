import { bot, tables } from "../../../index.js";
import { d } from "../../../lib/Class/Utils.js";
import { Xitext } from "../../../lib/Class/Xitext.js";
import { ART, artButton, artMenu, getUserArtInfo } from "../index.js";

const platformNames = {
	telegram: "Телеграм канала",
	vk: "ВК сообщества",
	twitter: "Twitter'а",
	furaffinity: "Furaffinity",
};

const publish = {
	start: new Xitext().text("Отправь арт ввиде ")._.group("файла").bold().url(null, d.guide(5))._.group(),
	addOrNext: new Xitext().text("Файл прикреплен. Отправь еще один, либо отправь следующий."),
	/**
	 * @param {string[]} platforms
	 * @param {import("../types.js").Language} lang_code
	 */
	description: (platforms, lang_code) =>
		new Xitext().text(
			"Теперь отправь мне описание арта на " +
				ART.languages[lang_code][1] +
				"\n(Для " +
				d.langJoin(platforms.map((e) => platformNames[e])) +
				")"
		),
	tagAddedSymbol: "✅",
	/**
	 * @param {string} platform
	 * @param {string[]} enabled_tags
	 * @param {string[]} tags
	 */
	tags: (platform, enabled_tags, tags) => {
		const tag_buttons = [
			...enabled_tags.map((e) => [publish.tagAddedSymbol + " " + e, "remove"]),
			...tags.map((e) => [e, "add"]),
		];

		return new Xitext()
			.text("Выбери хэштеги для " + platformNames[platform])
			.inlineKeyboard(...tag_buttons.map((e, i) => [artButton(e[0], "tag", platform, e[1], i)]), [
				artButton("Готово!", "tag", platform, "next"),
			]);
	},
};

/**
 * @typedef {import("../types.js").ArtSceneCache} ArtSceneCache
 */

artMenu.query(
	{
		name: "publish",
	},
	async (ctx) => {
		const user = tables.users.get(ctx.from.id);
		user.cache.scene = "art::photo";

		/** @type {ArtSceneCache} */
		const c = { descriptions: {}, tags: {} };
		user.cache.sceneCache = c;

		tables.users.set(ctx.from.id, user);
		ctx.deleteMessage(ctx.callbackQuery.message.message_id);
		ctx.reply(...publish.start._.build());
	}
);

/*---------------------------------------------------
//                  1 этап, фото
----------------------------------------------------*/
bot.on("message", async (ctx, next) => {
	if (!("document" in ctx.message)) return next();
	const data = ctx.data;
	if (ctx.chat.type !== "private") return;
	if (ART.scene.state(data) !== "photo") return next();

	data.user.cache.scene = "art::description";
	/** @type {ArtSceneCache} */
	// @ts-expect-error
	const c = data.user.cache.sceneCache;
	c.file_id = ctx.message.document.file_id;

	const userData = await getUserArtInfo(ctx.from.id);

	/** @type {import("../types.js").Language} */
	let firstLang;
	const firstLangServices = Object.entries(userData.services)
		.filter((e) => e[1].enabled)
		.filter((e) => {
			if (!firstLang) firstLang = e[1].lang;
			return e[1].lang === firstLang;
		})
		.map((e) => e[0]);

	c.waiting_lang = firstLang;
	data.user.cache.sceneCache = c;
	tables.users.set(ctx.from.id, data.user);

	ctx.reply(...publish.description(firstLangServices, firstLang)._.build());
});

/*---------------------------------------------------
//                  1 этап, описание
----------------------------------------------------*/
bot.on("message", async (ctx, next) => {
	if (!("text" in ctx.message)) return next();
	const data = ctx.data;

	if (ctx.chat.type !== "private") return next();
	if (ART.scene.state(data) !== "description") return next();

	/** @type {ArtSceneCache} */
	// @ts-expect-error
	const c = data.user.cache.sceneCache;
	c.descriptions[c.waiting_lang] = ctx.message.text;

	const userData = await getUserArtInfo(ctx.from.id);
	const enabledServices = Object.entries(userData.services).filter((e) => e[1].enabled);

	/** @type {import("../types.js").Language} */
	let nextLang;
	const nextLangServices = enabledServices
		.filter((e) => {
			if (!nextLang && !(e[1].lang in c.descriptions)) nextLang = e[1].lang;
			return e[1].lang === nextLang;
		})
		.map((e) => e[0]);

	const needDescription = nextLangServices.length > 0;

	if (needDescription) {
		c.waiting_lang = nextLang;
		ctx.reply(...publish.description(nextLangServices, nextLang)._.build());
	} else {
		delete data.user.cache.scene;
		delete c.waiting_lang;
		const service = enabledServices[0];
		c.tags[service[0]] ??= [];
		c.tags[service[0]].concat(service[1].default_tags);
		ctx.reply(...publish.tags(service[0], service[1].default_tags, service[1].tags)._.build());
	}

	data.user.cache.sceneCache = c;
	tables.users.set(ctx.from.id, data.user);
});

artMenu.query(
	{
		name: "tag",
	},
	async (ctx, path, edit) => {
		if (
			!("reply_markup" in ctx.callbackQuery.message) ||
			!("inline_keyboard" in ctx.callbackQuery.message.reply_markup)
		)
			return;

		const [platform, action, raw_index] = path;
		const tags = ctx.callbackQuery.message.reply_markup.inline_keyboard.map((e) => e[0].text);
		// Remove Готово! button
		tags.pop();
		const index = parseInt(raw_index);
		const tag = !isNaN(index) ? tags[index] : "<no-tag>";

		const user = tables.users.get(ctx.from.id);
		const userArtInfo = await getUserArtInfo(ctx.from.id);

		/** @type {import("../types.js").ArtService} */
		const service = userArtInfo.services[platform];

		/** @type {ArtSceneCache} */
		// @ts-expect-error
		const c = user.cache.sceneCache;

		if (action === "add") c.tags[platform].push(tag);
		if (action === "remove") {
			const clearTag = tag.replace(new RegExp(`^${publish.tagAddedSymbol} `), "");
			c.tags[platform] = c.tags[platform].filter((e) => e !== clearTag);
		}

		tables.users.set(ctx.from.id, user);

		if (action !== "next")
			edit(
				...publish
					.tags(
						platform,
						c.tags[platform],
						service.default_tags.concat(service.tags).filter((e) => !c.tags[platform].includes(e))
					)
					._.build()
			);
		else {
			edit(`Хештеги ${platformNames[platform]}: ${c.tags[platform].join(", ")}`);
			const doneServices = Object.keys(c.tags);
			const nextService = Object.entries(userArtInfo.services).find(
				([name, data]) => data.enabled && !doneServices.includes(name)
			);
			if (nextService) {
				c.tags[nextService[0]] ??= [];
				c.tags[nextService[0]].concat(nextService[1].default_tags);
				ctx.reply(...publish.tags(nextService[0], nextService[1].default_tags, nextService[1].tags)._.build());
			} else {
				ctx.reply("Публикация?");
			}
		}
	}
);
