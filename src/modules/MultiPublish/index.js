import { Command } from "../../lib/Class/Command.js";
import { Scene } from "../../lib/Class/Scene.js";
import { fmt, Markup, Xitext } from "../../lib/Class/Xitext.js";
import { safeRun } from "../../lib/utils/safe.js";
import { artButton, artMenu } from "./utils.js";
export * from "./utils.js";

new Command(
	{
		name: "art",
		description: "Публикация арта в нескольких соц-сетях",
		target: "private",
	},
	(ctx) => {
		ctx.reply(ART.mainLang, Markup.inlineKeyboard(ART.mainKeyboard));
	}
);

artMenu.query({ name: "back" }, (ctx, path, edit) => {
	edit(ART.mainLang, Markup.inlineKeyboard(ART.mainKeyboard));
});

export const ART = {
	platfroms: ["telegram", "twitter", "vk"],
	/** @type {Record<string, {attach: import("./types.js").AttachFunction; post: import("./types.js").PostFunction}>} */
	platformActions: {},
	mainLang: `Кроссплатформенная публикация (Бета!)`,
	mainKeyboard: [
		[artButton("Новая публикация", "publish")],
		[artButton("Платформы", "platforms")],
		[artButton("Настройки", "settings")],
	],
	languages: {
		ru: ["русский", "русском"],
		en: ["английский", "английском"],
	},
	scene: new Scene("Art"),
};

for (const service of ART.platfroms)
	safeRun("MultiPublish import", async () => {
		ART.platformActions[service] = await import(`./services/${service}/attach.js`);
	});

import "./menu/platforms.js";
import "./menu/publish.js";
import "./menu/settings.js";
