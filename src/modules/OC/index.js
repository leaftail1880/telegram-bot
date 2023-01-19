import { MultiMenu } from "../../lib/Class/Menu.js";
import { d, util } from "../../lib/Class/Utils.js";
import { Button, Xitext } from "../../lib/Class/Xitext.js";

/**
 * @typedef {Object} UserOC
 * @property {string} name
 * @property {string} description
 * @property {string} fileid
 */

export const m = new MultiMenu("OC"),
	link = TypedBind(m.link, m),
	editMsg = TypedBind(m.editMsgFromQuery, m);

export const lang = {
	create: {
		name: "Теперь отправь мне имя персонажа. (Не более 32 символов)",
		description:
			"Теперь отправь мне описание персонажа. (Ссылку на тг акк в нем оставлять не надо, я делаю это за вас при поиске))",
		done: "Успешно! /oc",
	},
	/**
	 *
	 * @param {string} t
	 * @returns
	 */
	skip: (t) => `${t}\nПропустить: /next`,
	edit: {
		name: () => lang.skip(lang.create.name),
		description: () => lang.skip(lang.create.description),
	},
	mainKeyboard: [
		[new Button("Добавить").data(link("reg"))],
		[new Button("Найти").data(link("find"))],
		[new Button("Мои персонажи").data(link("my"))],
	],
	main: new Xitext().text("Меню ")._.group("OC").bold().url(null, d.guide(6)).text(" (Или гифтменю):"),
	reg0: new Xitext()
		.text("Что бы прикрепить своего ОС к этому боту, отправь референс ОС ввиде ")
		._.group("файла")
		.bold()
		.url(null, d.guide(5))
		._.group()
		.text("\n Что бы выйти из этого пошагового меню используй команду /cancel"),
	edit0: new Xitext()
		.text("Отправь новый референс персонажа ввиде ")
		._.group("файла")
		.bold()
		.url(null, d.guide(5))
		._.group()
		.text(
			"\n\n Если хочешь оставить прошлый референс, используй /next\n Что бы выйти из этого пошагового меню используй команду /cancel"
		),
	maxLength: (type, length) =>
		new Xitext()
			.text(`${type} должно быть `)
			._.group("НЕ")
			.bold()
			._.group()
			.text(` больше ${length} символов в длину`)
			._.build(),
	find: "Список владельцев ОС",
	userOCS: (name) => `Персонажи ${name}`,
	myOCS: "Ваши персонажи",
	/**
	 *
	 * @param {string} name
	 * @param {string} description
	 * @param {string} ownerName
	 * @param {number} id
	 * @returns
	 */
	OC: (name, description, ownerName, id) =>
		new Xitext()._.group(name)
			.bold()
			.url(null, d.userLink(id))
			._.group()
			.text(`\n  ${description}\n\n`)
			.bold(`Владелец: `)
			.url(ownerName, d.userLink(id)),
	myOC: (name, description, owner) =>
		new Xitext()._.group(name)
			.bold()
			.url(null, `t.me/${owner}`)
			._.group()
			.text(`\n  ${description}\n\n`)
			.bold(`Это Ваш персонаж`),
};

import "./menu/find/find.js";
import "./menu/find/oc.js";
import "./menu/find/uOC.js";

import "./menu/index.js";

import "./menu/del.js";
import "./menu/edit.js";
import "./menu/my.js";
import "./menu/myoc.js";

import "./menu/reg.js";
import { TypedBind } from "leafy-utils";
