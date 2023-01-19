import { database, tables } from "../../index.js";
import { d, util } from "../../lib/Class/Utils.js";
import { Button, Xitext } from "../../lib/Class/Xitext.js";
import { data, newlog } from "../../lib/Service.js";
import { CreateGroup, CreateUser } from "./create.js";

/**
 *
 * @param {Xitext} XT
 */
function logReq(XT) {
	newlog({
		xitext: XT,
		consoleMessage: XT._.text,
		fileMessage: XT._.text,
		fileName: "addReq.txt",
	});
}

/**
 *
 * @param {Context} ctx
 */
function logNotAccepted(ctx) {
	const XT = new Xitext()
		.text("Лс (NoReg) ")
		.url(util.getName(ctx.from), ctx.from.username ? `https://t.me/${ctx.from.username}` : d.userLink(ctx.from.id));

	if ("text" in ctx.message) XT.text(`: ${ctx.message.text}`);
	logReq(XT);
}

/**
 *
 * @param {Context} ctx
 * @returns {Promise<DB.User | false>}
 */
export async function getUser(ctx) {
	let user = tables.users.get(ctx.from.id);

	if (!user) {
		if (ctx.chat.type === "private" && data.private) {
			if (!(ctx.from.id in data.joinCodes)) {
				data.joinCodes[ctx.from.id] = "waiting";

				const XT = new Xitext()
					.text("Запрос на использование бота в лс от ")
					.url(util.getName(ctx.from), d.userLink(ctx.from.id))
					.text("\nID: ")
					.mono(ctx.from.id)
					.inlineKeyboard(
						[new Button("Принять").data(d.query("N", "accept", ctx.from.id))],
						[new Button("Игнорировать").data(d.query("all", "delmsg"))]
					);

				logReq(XT);
				logNotAccepted(ctx);

				return false;
			} else if (data.joinCodes[ctx.from.id] === "accepted") {
				ctx.reply("Вы успешно добавлены в список разрешенных пользователей.");

				// 9.0.7 Fix: Memory leak
				delete data.joinCodes[ctx.from.id];
			} else if (data.joinCodes[ctx.from.id] === "waiting") {
				logNotAccepted(ctx);
				return false;
			}
		} else {
			user = CreateUser(ctx);
			user.needSafe = true;
		}
	}

	/**
	 *
	 * @template {keyof DB.User} P1
	 * @template {keyof DB.User[P1]} P2
	 * @param {P1} path1
	 * @param {P2} path2
	 * @param {DB.User[P1][P2]} current
	 */
	function detectUpdate(path1, path2, current) {
		if (user[path1][path2] != current) {
			user[path1][path2] = current;
			user.needSafe = true;
		}
	}

	if (ctx.chat.type === "private") detectUpdate("cache", "dm", 1);
	detectUpdate("static", "name", util.getName(ctx.from));
	detectUpdate("static", "nickname", ctx.from.username);

	return user;
}
/**
 *
 * @param {Context} ctx
 * @returns {Promise<DB.Group | false>}
 */
export async function getGroup(ctx) {
	if (ctx.chat.type !== "supergroup" && ctx.chat.type !== "group") return;

	/**
	 * @type {DB.Group}
	 */
	let group = tables.groups.get(ctx.chat.id);
	let update = false;

	if (!group) {
		if (data.private) {
			if (ctx.chat.id === data.chatID.log) data.joinCodes[ctx.chat.id] = "accepted";

			if (!(ctx.chat.id in data.joinCodes)) {
				data.joinCodes[ctx.chat.id] = "waiting";

				const XT = new Xitext()
					.text("Запрос на добавление группы:\n")
					.bold(ctx.chat.title)
					.text("\n")
					.mono(ctx.chat.id)
					.text("\n\nКод: ")
					.mono(ctx.chat.id.toString(16))
					.inlineKeyboard(
						[new Button("Принять").data(d.query("N", "group", ctx.chat.id))],
						[new Button("Игнорировать").data(d.query("all", "delmsg"))]
					);

				newlog({
					xitext: XT,
					consoleMessage: XT._.text,
					fileMessage: XT._.text,
					fileName: "addReq.txt",
				});

				if (ctx.botInfo.can_read_all_group_messages)
					await ctx.reply(
						...new Xitext()
							.text(
								"К сожалению, я не настроен для работы с этой группой. Если мой создатель разрешил вам, то отправьте ему код снизу. А теперь прошу извинить, мне нужно идти.\n\nКод вашей группы: "
							)
							.mono(ctx.from.id.toString(16))
							._.build()
					);
				ctx.leaveChat();
				return false;
			} else if (data.joinCodes[ctx.chat.id] === "accepted") {
				ctx.reply("Группа успешно добавлена в список разрешенных.");
			} else {
				ctx.leaveChat();
				return false;
			}
		}
		group = CreateGroup(ctx.chat.id, ctx.chat.title, [ctx.from.id]);
		update = true;
	}

	/**
	 *
	 * @template {keyof DB.Group} P1
	 * @template {keyof DB.Group[P1]} P2
	 * @param {P1} path1
	 * @param {P2} path2
	 * @param {DB.Group[P1][P2]} current
	 */
	function detectUpdate(path1, path2, current) {
		if (group[path1][path2] != current) {
			group[path1][path2] = current;
			update = true;
		}
	}

	detectUpdate("static", "id", ctx.chat.id);
	detectUpdate("static", "title", ctx.chat.title);
	if (!group.cache.members.includes(ctx.from.id)) {
		const set = new Set(group.cache.members);
		set.add(ctx.from.id);
		group.cache.members = [...set.values()];
		update = true;
	}

	if (update) database.set(d.group(ctx.chat.id), group);

	return group;
}
