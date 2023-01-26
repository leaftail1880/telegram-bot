import { line } from "cli-color/erase.js";
import { data, newlog, tables } from "../../index.js";
import { u, util } from "../../lib/Class/Utils.js";
import { Button, code, fmt, FmtString, link, Xitext } from "../../lib/Class/Xitext.js";
import { CreateGroup, CreateUser } from "./create.js";

/**
 *
 * @param {FmtString | { _: { build(): [string, any]; text: string }; }} XT
 */
function logReq(XT) {
	const text = "text" in XT ? XT.text : XT._.text;
	newlog({
		text: XT,
		consoleMessage: text,
		fileMessage: text,
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
		.url(
			util.getTelegramName(ctx.from),
			ctx.from.username ? `https://t.me/${ctx.from.username}` : u.userLink(ctx.from.id)
		);

	if ("text" in ctx.message) XT.text(`: ${ctx.message.text}`);
	logReq(XT);
}

/**
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
					.text("Запрос на лс от ")
					.url(util.getTelegramName(ctx.from), u.userLink(ctx.from.id))
					.text("\nID: ")
					.mono(ctx.from.id)
					.inlineKeyboard(
						[Button("Принять", u.query("N", "accept", ctx.from.id))],
						[Button("Игнорировать", u.query("all", "delmsg"))]
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
	detectUpdate("static", "name", util.getTelegramName(ctx.from));
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
						[Button("Принять", u.query("N", "group", ctx.chat.id))],
						[Button("Игнорировать", u.query("all", "delmsg"))]
					);

				newlog({
					text: XT,
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

	if (update) tables.groups.set(ctx.chat.id, group);

	return group;
}
