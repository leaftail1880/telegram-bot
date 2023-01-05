import { Command } from "../../lib/Class/Command.js";
import { Xitext } from "../../lib/Class/Xitext.js";
import { safeRun } from "../../lib/utils/safeRun.js";
import { artButton, artMenu } from "./utils.js";

export const artLang = {
	main: new Xitext()
		.text("Кроссплатформенная публикация (Бета!)")
		.inlineKeyboard(
			[artButton("Новая публикация", "publish")],
			[artButton("Платформы", "platforms")],
			[artButton("Настройки", "settings")]
		),
};

new Command(
	{
		name: "art",
		description: "Публикация арта в нескольких соц-сетях",
		type: "private",
	},
	(ctx) => {
		ctx.reply(...artLang.main._.build());
	}
);

artMenu.query({ name: "back" }, (ctx, path, edit) => {
	edit(...artLang.main._.build());
});

export const artPlatforms = ["telegram", "twitter", "vk"];

for (const service of artPlatforms) safeRun("MultiPublish import", () => import(`./services/${service}/index.js`));

import "./menu/platforms.js";
import "./menu/publish.js";
import "./menu/settings.js";
