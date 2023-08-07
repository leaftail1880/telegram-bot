import { Markup } from "telegraf";
import { bold, code, fmt, link } from "telegraf/format";
import { Service, tables } from "../../index.js";
import { u, util } from "../../lib/utils/index.js";
import { CreateGroup, CreateUser } from "./create.js";
import { GuardLogger } from "./index.js";

/**
 *
 * @param {Context} ctx
 */
function logNotAccepted(ctx) {
	const message = fmt`${
		ctx.chat.type === "private" ? "Лс" : "Группа"
	} (new) ${link(
		util.getTelegramName(ctx.from),
		ctx.from.username
			? `https://t.me/${ctx.from.username}`
			: u.userLink(ctx.from.id)
	)}${ctx.message && "text" in ctx.message ? `: ${ctx.message.text}` : ""}`;

	GuardLogger.log({
		text: message,
		consoleMessage: message.text,
		fileMessage: message.text,
	});
}

/**
 * @param {Context} ctx
 * @returns {Promise<DB.User | false>}
 */
export async function getUser(ctx) {
	let user = tables.users.get(ctx.from.id);

	if (!user) {
		if (ctx.chat.type === "private" && Service.private) {
			if (!(ctx.from.id in Service.joins)) {
				Service.joins[ctx.from.id] = "waiting";

				const message = fmt`Запрос на лс от ${link(
					util.getTelegramName(ctx.from),
					u.userLink(ctx.from.id)
				)}\nID: ${code(ctx.from.id.toString())}`;

				GuardLogger.log({
					text: message,
					textExtra: {
						...Markup.inlineKeyboard([
							[u.btn("Принять", "N", "accept", ctx.from.id)],
							[u.btn("Игнорировать", "all", "delmsg")],
						]),
					},
					fileMessage: message.text,
					consoleMessage: message.text,
				});

				logNotAccepted(ctx);
				return false;
			} else if (Service.joins[ctx.from.id] === "accepted") {
				ctx.reply("Вы успешно приняты в список разрешенных пользователей.");

				// 9.0.7 Fix: leak
				delete Service.joins[ctx.from.id];
			} else if (Service.joins[ctx.from.id] === "waiting") {
				logNotAccepted(ctx);
				return false;
			}
		}
			user = CreateUser(ctx);
			user.needSafe = true;
		
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
 * @param {Context} ctx
 * @returns {Promise<DB.Group | false>}
 */
export async function getGroup(ctx) {
	if (ctx.chat?.type !== "supergroup" && ctx.chat?.type !== "group") return;

	/**
	 * @type {DB.Group}
	 */
	let group = tables.groups.get(ctx.chat.id);
	let update = false;

	if (!group) {
		if (Service.private) {
			if (ctx.chat.id === Service.chat.log)
				Service.joins[ctx.chat.id] = "accepted";

			if (!(ctx.chat.id in Service.joins)) {
				Service.joins[ctx.chat.id] = "waiting";

				const id = ctx.chat.id;
				const message = fmt`Запрос на добавление группы:\n${bold(
					ctx.chat.title
				)}\n${code(id.toString())}\n\nКод: ${code(id.toString(16))}`;

				GuardLogger.log({
					text: message,
					textExtra: {
						...Markup.inlineKeyboard([
							[u.btn("Принять", "N", "group", ctx.chat.id)],
							[u.btn("Игнорировать", "all", "delmsg")],
						]),
					},
					consoleMessage: message.text,
					fileMessage: message.text,
				});

				if (ctx.botInfo.can_read_all_group_messages)
					await ctx.reply(
						fmt`К сожалению, я не настроен для работы с этой группой. Если мой создатель разрешил вам, то отправьте ему код снизу. А теперь прошу извинить, мне нужно идти.\n\nКод вашей группы: ${code(
							ctx.from.id.toString(16)
						)}`
					);
				ctx.leaveChat();
				return false;
			} else if (Service.joins[ctx.chat.id] === "accepted") {
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
/**
 * @param {Context} ctx
 * @returns {Promise<boolean>}
 */
export async function getChannel(ctx) {
	return false;
}
