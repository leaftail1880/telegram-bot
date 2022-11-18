import { Context } from "telegraf";
import { database } from "../../index.js";
import { d, util } from "../../lib/Class/Utils.js";
import { Button, Xitext } from "../../lib/Class/Xitext.js";
import { data, log } from "../../lib/SERVISE.js";
import { CreateGroup, CreateUser } from "./create.js";

/**
 *
 * @param {Context} ctx
 * @returns {Promise<DB.User | false>}
 */
export async function getUser(ctx) {
	let user = await database.get(d.user(ctx.from.id), true);

	if (!user) {
		if (ctx.chat.type === "private" && data.private) {
			if (!(ctx.from.id in data.joinCodes)) {
				data.joinCodes[ctx.from.id] = "waiting";
				ctx.reply(
					...new Xitext()
						.text("Sorry, but this bot isn't avaible to you :/\nConnect code: ")
						.mono(ctx.from.id.toString(16))
						._.build()
				);
				log(
					...new Xitext()
						.text("Запрос на использование бота в лс от ")
						.url(util.getName(ctx.from), d.userLink(ctx.from.id))
						.text("\nКод: ")
						.mono(ctx.from.id.toString(16))
						.inlineKeyboard(
							[new Button("Принять").data(d.query("N", "accept", ctx.from.id))],
							[new Button("Игнорировать").data(d.query("all", "delmsg"))]
						)
						._.build()
				);
				return false;
			} else {
				ctx.reply("Вы успешно добавлены в список разрешенных пользователей.");
			}
		} else if (data.joinCodes[ctx.from.id] === "accepted") {
			user = CreateUser(ctx);
			user.needSafe = true;
		}
	}

	function detectUpdate(previous, current) {
		if (previous != current) {
			previous = current;
			user.needSafe = true;
		}
	}

	detectUpdate(user.static.name, util.getName(ctx.from));
	detectUpdate(user.static.nickname, ctx.from.username);

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
	let group = await database.get(d.group(ctx.chat.id), true);
	let update = false;

	if (!group) {
		if (data.private) {
			if (!(ctx.chat.id in data.joinCodes)) {
				data.joinCodes[ctx.chat.id] = "waiting";
				ctx.reply(
					...new Xitext()
						.text(
							"К сожалению, я не настроен для работы с этой группой. Если мой создатель разрешил вам, то отправьте ему код снизу. А теперь прошу извинить, мне нужно идти.\n\nКод вашей группы: "
						)
						.mono(ctx.from.id.toString(16))
						._.build()
				);
				log(
					...new Xitext()
						.text("Запрос на добавление группы:\n")
						.bold(ctx.chat.title)
						.text("\n")
						.mono(ctx.chat.id)
						.text("\n\nКод: ")
						.mono(ctx.chat.id.toString(16))
						.inlineKeyboard(
							[new Button("Принять").data(d.query("N", "group", ctx.chat.id))],
							[new Button("Игнорировать").data(d.query("all", "delmsg"))]
						)
						._.build()
				);
				await ctx.leaveChat();
				return false;
			} else if (data.joinCodes[ctx.chat.id] === "accepted") {
				ctx.reply("Группа успешно добавлена в список разрешенных.");
			}
		}

		group = CreateGroup(ctx.chat.id, ctx.chat.title, [ctx.from.id]);
		update = true;
	}

	if (group.static.id !== ctx.chat.id) {
		group.static.id = ctx.chat.id;
		update = true;
	}

	if (!group.cache.members.includes(ctx.from.id)) {
		group.cache.members = util.add(group.cache.members, ctx.from.id);
		update = true;
	}

	if (group.static.title != ctx.chat.title) {
		group.static.title = ctx.chat.title;
		update = true;
	}

	if (update) database.set(d.group(ctx.chat.id), group, true);

	return group;
}
