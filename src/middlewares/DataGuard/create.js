import { newlog } from "../../index.js";
import { TriggerEventListeners } from "../../lib/Class/Events.js";
import { util } from "../../lib/Class/Utils.js";
import { Xitext } from "../../lib/Class/Xitext.js";

const newUsers = {};

const newGroups = {};

/**
 *
 * @param {Context} ctx
 * @returns {DB.User}
 */
export function CreateUser(ctx) {
	const id = ctx.from.id;
	const name = util.getName(ctx.from);
	const nickname = ctx.from.username;

	if (newUsers[id]) return newUsers[id];

	const text = `Новый пользователь!\n Имя: ${name}\n ID: ${id}${nickname ? `\n @${nickname}` : ""}`;
	newlog({
		consoleMessage: text,
		xitext: new Xitext().text(text),
		fileMessage: text,
		fileName: "groups.txt",
	});

	TriggerEventListeners("new.member", ctx);

	const user = {
		static: {
			id: id,
			nickname: nickname,
			name: name,
		},
		cache: {},
	};

	newUsers[id] = user;
	return user;
}

/**
 *
 * @param {number} id
 * @param {string} title
 * @param {Array<number>} members
 * @returns {DB.Group}
 */
export function CreateGroup(id, title, members = []) {
	if (newGroups[id]) return newGroups[id];
	const text = `Новая группа!\n Название: ${title}\n ID: ${id}`;
	newlog({
		consoleMessage: text,
		xitext: new Xitext().text(text),
		fileMessage: text,
		fileName: "groups.txt",
	});
	const group = {
		static: {
			id: id,
			title: title,
		},
		cache: {
			members: members,
			lastCall: Date.now(),
			lastPin: {},
		},
	};
	newGroups[id] = group;
	return group;
}
