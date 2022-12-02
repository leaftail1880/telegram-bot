import { d } from "../../lib/Class/Utils.js";
import { MultiMenuV1 } from "../../lib/Class/Menu.js";
import { Button, Xitext } from "../../lib/Class/Xitext.js";
import { PersonalSubs } from "../../lib/Class/Subscriptions.js";

export const $PREFIX = "SB";

export const menu = new MultiMenuV1($PREFIX);

export const Subs = {
	newMembers: [true, "Новый участник чата"],
	chatEvents: [true, "Событие в чате"],
	botUpdates: [true, "Обновление бота"],
};

/**
 * @type {Object}
 */
const defining = {};

for (const key in Subs) {
	defining[key] = Subs[key][0];
}

/**
 * @type {Record<keyof typeof Subs, boolean>}
 */
export const DefaultSubs = defining;

export const lang = {
	main: async (id, page = 1) => {
		const c = new Xitext();

		c.text("Список ваших ").url("подписок", d.guide(9)).text(":");

		const s = new PersonalSubs(id);

		const B = ([setting, value]) => [
			new Button(`${value ? "✅" : "🔺"} ${Subs[setting][1]}`).data(menu.link("c", page, setting, value ? 0 : 1)),
		];

		const get = Object.entries(await s.get());
		const buttons = get.map(B);

		c.inlineKeyboard(...menu.generatePageSwitcher(buttons, undefined, "page", page));

		return c._.build();
	},
};
