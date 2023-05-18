import { newlog } from "../../index.js";
import { emit } from "../../lib/Class/Events.js";
import { util } from "../../lib/Class/Utils.js";
import { fmt } from "../../lib/Class/Xitext.js";

/** @type {Record<number, DB.User>} */
const CREATED_USERS = {};

/** @type {Record<number, DB.Group>} */
const CREATES_GROUPS = {};

/**
 * @param {Context} ctx
 * @returns {DB.User}
 */
export function CreateUser(ctx) {
	const id = ctx.from.id;
	const name = util.getTelegramName(ctx.from);
	const nickname = ctx.from.username;

	if (CREATED_USERS[id]) return CREATED_USERS[id];

	const text = `Новый пользователь!\n Имя: ${name}\n ID: ${id}${
		nickname ? `\n @${nickname}` : ""
	}`;
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

	CREATED_USERS[id] = user;
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
	if (CREATES_GROUPS[id]) return CREATES_GROUPS[id];
	const text = `Новая группа!\n Название: ${title}\n ID: ${id}`;
	newlog({
		consoleMessage: text,
		text: fmt(text),
		fileMessage: text,
		fileName: "groups.txt",
	});

	/** @type {DB.Group} */
	const group = {
		static: {
			id: id,
			title: title,
		},
		cache: {
			members: members,
			lastCall: Date.now(),
			silentMembers: {},
		},
	};
	CREATES_GROUPS[id] = group;
	return group;
}
