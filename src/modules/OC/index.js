import { TypedBind } from "leafy-utils";
import { MultiMenu } from "../../lib/Class/Menu.js";
import { Scene } from "../../lib/Class/Scene.js";
import { d } from "../../lib/Class/Utils.js";
import { bold, fmt, link, Xitext } from "../../lib/Class/Xitext.js";
import { safeLoad } from "../../lib/utils/safe.js";

/**
 * @typedef {Object} UserOC
 * @property {string} name
 * @property {string} description
 * @property {string} fileid
 */

export const OC = new Scene("OC");

export const m = new MultiMenu("OC");

export const editMsg = TypedBind(m.editMsgFromQuery, m);

export const ocbutton = m.createButtonMaker();

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
	mainKeyboard: [[ocbutton("Найти", "find")], [ocbutton("Добавить", "reg")], [ocbutton("Мои персонажи", "my")]],
	main: new Xitext().text("Меню ")._.group("OC").bold().url(null, d.guide(6)).text(" (Или гифтменю):"),
	main2: fmt`Меню персонажей (${link("OC", d.guide(6))})`,

	edit0: new Xitext()
		.text("Отправь новый референс персонажа ввиде ")
		._.group("файла")
		.bold()
		.url(null, d.guide(5))
		._.group()
		.text(
			"\n\n Если хочешь оставить прошлый референс, используй /next\n Что бы выйти из этого пошагового меню используй команду /cancel"
		),
	maxLngth: (type, length) =>
		new Xitext().text(`${type} должно быть `).bold("не").text(` больше ${length} символов в длину.`)._.build(),
	/**
	 * @param {string} type
	 * @param {number | string} length
	 */
	maxLength: (type, length, end = "о") =>
		fmt`${type} должн${end} быть ${bold("не")} больше ${length} символов в длину.`,
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

const modules = {
	menu: ["index", "del", "edit", "my", "myoc", "reg"],
	"menu/find": ["find", "oc", "uOC"],
};

const mds = [];

for (const [folder, files] of Object.entries(modules)) {
	for (const file of files) mds.push(`./${folder}/${file}.js`);
}

safeLoad(mds, (path) => import(path), false);
