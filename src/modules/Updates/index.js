import { EventListener } from "../../lib/Class/Events.js";
import { Subscriptions } from "../../lib/Class/Subscriptions.js";
import { Xitext } from "../../lib/Class/Xitext.js";
import { bot } from "../../lib/launch/tg.js";
import { data } from "../../lib/SERVISE.js";

const Updates = [
	"Добавлена система подписок",
	"Обновления бота теперь будут писаться сюда, отключить можно с помощью команды /sub",
	"Мелкие улучшения и ускорения",
];

new EventListener("new.release", 1, async (_c, next, _d, extra) => {
	const users = await Subscriptions.list("botUpdates");

	console.log(users);

	/** @type {Xitext | [string, any]} */
	let text = new Xitext()._.group(data.v)
		.bold()
		.url(null, "https://t.me/xiller228")
		._.group()
		.text("\n");

	for (const line of Updates) text.bold("\n - ").text(line);

	text = text._.build();

	for (const user of users) {
		await bot.telegram.sendMessage(user, ...text);
	}
});
