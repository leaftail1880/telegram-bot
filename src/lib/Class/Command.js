import { Context } from "telegraf";
import config from "../../config.js";
import { database } from "../../index.js";
import { bot } from "../launch/tg.js";
import { data as $data, log } from "../SERVISE.js";
import { isAdmin } from "../utils/isAdmin.js";
import { safeRun } from "../utils/safeRun.js";
import { EventListener } from "./Events.js";
import { ssn } from "./Session.js";
import { d, util } from "./Utils.js";
import { Xitext } from "./Xitext.js";

/**
 * @type {Array<CommandTypes.Stored>}
 */
const public_cmds = [];

/**
 * @type {Array<CommandTypes.Stored>}
 */
const private_cmds = [];

export class Command {
	/**
	 *
	 * @param {CommandTypes.RegistrationInfo} info
	 * @param {CommandTypes.Callback} callback
	 * @returns
	 */
	constructor(info, callback) {
		if (!info.name) return;

		// Регистрация инфы
		const cmd = {
			info: {
				name: info.name,
				description: info.description ?? "Пусто",
				type: info.type,
				perm: info.permisson ?? 0,
				hide: info.hide,
				session: info.session,
				aliases: info.aliases,
			},
			callback: callback,
		};

		// Ы
		if (!info.specprefix) {
			public_cmds.push(cmd);
		} else {
			private_cmds.push(cmd);
		}
		return this;
	}
	/**
	 *
	 * @param {string} a
	 * @returns {CommandTypes.Stored | "not_found" | boolean}
	 */
	static getCmd(a) {
		if (!a) return false;
		/**
		 * @type {CommandTypes.Stored}
		 */
		let cmd;

		const type = /^\/\w+/.test(a) ? "slash" : /^\-\w*/.test(a) ? "special" : "message";
		if (type === "message") return false;

		const // Команда из сообщения
			cc = a.match(/^.([^@\s]*)/),
			c = cc[1],
			// Функция поиска команды в массиве по имени или сокращению
			findC = (e) => e.info?.name == c || e.info?.aliases?.includes(c);

		cmd = type === "slash" ? public_cmds.find(findC) : private_cmds.find(findC);

		return cmd ?? "not_found";
	}
	/**
	 *
	 * @param {CommandTypes.Stored} command
	 * @param {Context} ctx
	 * @returns
	 */
	static async cantUse(command, ctx, user = null) {
		// Условия разрешений
		let _lg = command.info.type === "group" && (ctx.chat.type === "group" || ctx.chat.type === "supergroup"), // Где
			_lp = command.info.type === "private" && ctx.chat.type === "private",
			_lc = command.info.type === "channel" && ctx.chat.type === "channel",
			_la = command.info.type === "all" || !command.info.type,
			// Если команда для всех
			_pall = command.info.perm === 0,
			// Если команда для админов, и отправитель админ
			_padmin = command.info.perm === 1 && (await isAdmin(ctx, ctx.message.from.id, user)),
			// Если команда хильки
			_pxiller = command.info.perm === 2 && ctx.message.from.id == $data.chatID.owner;

		// Если нет ни одного разрешения, значит нельзя
		return !((_la || _lc || _lg || _lp) && (_pall || _padmin || _pxiller));
	}
}

/**======================ss
 *    Приветствие
 *========================**/
new Command(
	{
		name: "start",
		description: "Начало работы с ботом в лс",
		type: "private",
		hide: true,
	},
	(ctx, _args, data) => {
		ctx.reply(`${data.user.static.name} Кобольдя очнулся. Список доступных Вам команд: /help`);
	}
);
/*========================*/

new Command(
	{
		name: "help",
		description: "Список команд",
		type: "all",
	},
	async (ctx) => {
		let c = false;
		const a = new Xitext();
		const rigths = await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id);

		for (const e of public_cmds) {
			if ((await Command.cantUse(e, ctx, rigths)) || e.info.hide) continue;
			if (!c) a.text(`Команды:\n`), (c = true);
			a.text(`  /${e.info.name}`);
			a.italic(` - ${e.info.description}\n`);
		}

		for (const e of private_cmds) {
			if (await Command.cantUse(e, ctx, rigths)) continue;
			a.text(`  `);
			a.mono(`-${e.info.name}`);
			a.italic(` - ${e.info.description}\n`);
		}

		if (!a._.text) return ctx.reply("Команды недоступны");
		ctx.reply(...a._.build());
	}
);

new Command(
	{
		name: "cancel",
		description: "Выход из пошагового меню",
		permisson: 0,
		hide: true,
		type: "private",
	},
	async (ctx, _args, data) => {
		const user = data.user;
		if (user?.cache?.session) {
			await ctx.reply(`Вы вышли из меню ${user.cache.session}`);
			delete user.cache.session;
			delete user.cache.sessionCache;
			await database.set(d.user(ctx.from.id), user);
		} else ctx.reply("Вы не находитесь в меню!");
	}
);

new Command(
	{
		name: "next",
		description: "Переходит на следующий шаг меню",
		permisson: 0,
		hide: true,
		type: "private",
	},
	async (ctx, _a, data) => {
		const user = data.user;
		if (typeof user?.cache?.session === "string") {
			const [_, sessionKey, rawStage] = user.cache.session.match(/^(.+)::(\d+)/);
			const stage = parseInt(rawStage);
			const sess = ssn[sessionKey];

			if (sess) {
				if (typeof sess.executers[stage] === "function") {
					sess.executers[stage](ctx, user);
				} else ctx.reply("Этот шаг не предусматривает пропуска!");
			} else delete user.cache.session;

			await database.set(d.user(ctx.from.id), user);
		} else ctx.reply("Вы не находитесь в меню!");
	}
);

const V = {
	private: "Лc",
	channel: "Канал",
	group: "Группа",
	supergroup: "Группа",
};

EventListener("modules.load", 0, (_, next) => {
	//  Общие команды группы
	let groupCommands = [],
		// Админские в группах
		groupAdminCommands = [],
		// Общие команды в лс
		privateCommands = [],
		// Команды для управления ботом
		botAdminCommands = [],
		// Команды которые будут выведены в лог
		all = [];

	public_cmds.forEach((cmd) => {
		let m = { command: cmd.info.name, description: cmd.info.description };
		if (!cmd.info.hide) {
			if ((cmd.info.type == "group" || cmd.info.type == "all") && cmd.info.perm == 0) groupCommands.push(m);
			if ((cmd.info.type == "group" || cmd.info.type == "all") && cmd.info.perm == 1) groupAdminCommands.push(m);
			if ((cmd.info.type == "private" || cmd.info.type == "all") && cmd.info.perm == 0)
				privateCommands.push(m), botAdminCommands.push(m);
			if (cmd.info.perm == 2) botAdminCommands.push(m);
		}

		all.push(cmd.info.name);
	});
	private_cmds.forEach((e) => all.push(e.info.name));

	if (groupCommands[0])
		bot.telegram.setMyCommands(groupCommands, {
			scope: { type: "all_group_chats" },
		});
	if (groupAdminCommands[0])
		bot.telegram.setMyCommands(groupAdminCommands.concat(groupCommands), {
			scope: { type: "all_chat_administrators" },
		});
	if (privateCommands[0])
		bot.telegram.setMyCommands(privateCommands, {
			scope: { type: "all_private_chats" },
		});
	if (botAdminCommands[0])
		bot.telegram.setMyCommands(botAdminCommands.concat(privateCommands), {
			scope: { type: "chat", chat_id: $data.chatID.owner },
		});
	next();
});

EventListener("text", 9, async (ctx, next, data) => {
	const text = ctx.message.text;

	const command = Command.getCmd(text);

	if (command === "not_found" && ctx.chat.type === "private") {
		ctx.reply("Неизвестная команда. /help");
		log("Unknown command: " + ctx.message.text);
	}

	if (typeof command !== "object") return next();

	data.user_rigths = await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id);

	if (await Command.cantUse(command, ctx, data.user_rigths))
		return ctx.reply("В этом чате эта команда недоступна. /help", {
			reply_to_message_id: ctx.message.message_id,
			allow_sending_without_reply: true,
		});

	// All good, run
	const args =
		text
			.replace(config.command.clearCommand, "")
			?.match(config.command.parseArgs)
			?.map((e) => e.replace(/"(.+)"/, "$1").toString()) ?? [];
	const name = util.getFullName(data.user, ctx.from);
	const xt = new Xitext()._.group(name)
		.url(null, ctx.from.id !== $data.chatID.owner ? d.userLink(ctx.from.id) : `https://t.me/${ctx.from.username}`)
		.bold()
		._.group()
		.text(` ${text}`);

	safeRun(V[ctx.chat.type], () => command.callback(ctx, args, data, command), xt, xt, ctx.chat.id !== $data.chatID.log);
});
