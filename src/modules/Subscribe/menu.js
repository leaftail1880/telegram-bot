import { MultiMenu } from "../../lib/Class/Menu.js";

export const SubMenu = new MultiMenu("SB");

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
