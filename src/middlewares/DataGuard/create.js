import { newlog } from "../../index.js";
import { emit } from "../../lib/Class/Events.js";
import { util } from "../../lib/Class/Utils.js";
import { fmt } from "../../lib/Class/Xitext.js";

/** @type {Record<number, DB.User>} */
const newUsers = {};

/** @type {Record<number, DB.Group>} */
const newGroups = {};

/**
 * @param {Context} ctx
 * @returns {DB.User}
 */
export function CreateUser(ctx) {
	const id = ctx.from.id;
	const name = util.getTelegramName(ctx.from);
	const nickname = ctx.from.username;

	if (newUsers[id]) return newUsers[id];

	const text = `Новый пользователь!\n Имя: ${name}\n ID: ${id}${nickname ? `\n @${nickname}` : ""}`;
	newlog({
		consoleMessage: text,
		text: fmt(text),
		fileMessage: text,
		fileName: "groups.txt",
	});

	emit("new.member");

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
		text: fmt(text),
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
