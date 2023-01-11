import { Command } from "../../lib/Class/Command.js";
import { Xitext } from "../../lib/Class/Xitext.js";
import { safeRun } from "../../lib/utils/safeRun.js";
import { artButton, artMenu } from "./utils.js";

new Command(
	{
		name: "art",
		description: "Публикация арта в нескольких соц-сетях",
		target: "private",
	},
	(ctx) => {
		ctx.reply(...ART.lang.main._.build());
	}
);

artMenu.query({ name: "back" }, (ctx, path, edit) => {
	edit(...ART.lang.main._.build());
});

export const ART = {
	platfroms: ["telegram", "twitter", "vk"],
	/** @type {Record<string, {attach: import("./types/Integrations.js").AttachFunction; post: import("./types/Integrations.js").PostFunction}>} */
	platformActions: {},
	lang: {
		main: new Xitext()
			.text("Кроссплатформенная публикация (Бета!)")
			.inlineKeyboard(
				[artButton("Новая публикация", "publish")],
				[artButton("Платформы", "platforms")],
				[artButton("Настройки", "settings")]
			),
	},
	languages: {
		ru: ["русский", "русском"],
		en: ["английский", "английском"],
	},
};

for (const service of ART.platfroms)
	safeRun("MultiPublish import", async () => {
		ART.platformActions[service] = await import(`./services/${service}/attach.js`);
	});

import "./menu/platforms.js";
import "./menu/publish.js";
import "./menu/settings.js";
