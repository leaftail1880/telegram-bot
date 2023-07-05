import { MultiMenu } from "../../lib/Class/Menu.js";

export const SubMenu = new MultiMenu("SB");

/**
 * @type {Record<string, [boolean, string]>}
 */
export const Subs = {
	newMembers: [true, "Новый участник чата"],
	chatEvents: [true, "Событие в чате"],
	botUpdates: [true, "Обновление бота"],
};

export const DefaultSubs = Object.fromEntries(Object
  .entries(Subs)
  .map(([key, value]) => [key, value[0]])
)
