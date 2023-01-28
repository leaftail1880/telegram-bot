import clc from "cli-color";
import { Context } from "telegraf";
import config from "../../config.js";
import { bot, data as Data, newlog } from "../../index.js";
import { safeRun } from "../utils/safe.js";
import { on } from "./Events.js";
import { hasText } from "./Filters.js";
import { u, util } from "./Utils.js";
import { Xitext } from "./Xitext.js";

/** @type {CommandTypes.Stored[]} */
const Commands = [];

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
		/** @type {CommandTypes.Stored} */
		const StoreInfo = {
			info: {
				name: info.name,
				description: info.description ?? "Пусто",
				target: info.target ?? "all",
				permission: info.permission ?? "all",
				hideFromHelpList: info.hideFromHelpList,
				prefix: ["/"],
				allowScene: info.allowScene,
				aliases: info.aliases,
			},
			callback: callback,
		};

		if (typeof info.prefix === "boolean") StoreInfo.info.prefix = ["-"];
		if (typeof info.prefix === "string") StoreInfo.info.prefix = [info.prefix];
		if (Array.isArray(info.prefix)) StoreInfo.info.prefix = info.prefix;

		Commands.push(StoreInfo);
	}
	/**
	 *
	 * @param {string} message
	 * @returns {CommandTypes.Stored | "not_found" | boolean}
	 */
	static getCmd(message) {
		if (!message) return false;
		const match = message.match(config.command.get);
		if (!match) return false;

		const [, prefix, command] = match;
		return (
			Commands.find(
				(с) => с.info.prefix.includes(prefix) && (с.info.name === command || с.info.aliases?.includes(command))
			) ?? "not_found"
		);
	}
	/**
	 *
	 * @param {CommandTypes.Stored} command
	 * @param {Context} ctx
	 * @param {import("telegraf/types").ChatMember} chatMember
	 * @returns
	 */
	static cantUse(command, ctx, chatMember = null) {
		const location_group =
			command.info.target === "group" && (ctx.chat.type === "group" || ctx.chat.type === "supergroup");
		const location_private = command.info.target === "private" && ctx.chat.type === "private";
		const location_all = command.info.target === "all";

		const permission_all = command.info.permission === "all";
		const permission_admin =
			command.info.permission === "group_admins" && ["administrator", "creator"].includes(chatMember.status);
		const permission_owner = command.info.permission === "bot_owner" && ctx.from.id == Data.chatID.owner;

		return !(
			(location_all || location_group || location_private) &&
			(permission_all || permission_admin || permission_owner)
		);
	}
	/**
	 *
	 * @param {Context & { message: import("telegraf/types").Message.TextMessage;}} ctx
	 * @param {DB.User} dbuser
	 * @param {string} message
	 */
	static Log(ctx, dbuser, message = null) {
		const name = util.getName(dbuser, ctx.from);

		const xt = new Xitext()
			.text(`${V[ctx.chat.type]} `)
			._.group(name)
			.url(null, ctx.from.id !== Data.chatID.owner ? u.userLink(ctx.from.id) : `https://t.me/${ctx.from.username}`)
			.bold()
			._.group()
			.text(`${message ? ` ${message}` : ""}: ${ctx.message.text}`);
		const text = xt._.text;

		if (ctx.chat.id !== Data.chatID.log)
			newlog({
				text: xt,
				consoleMessage: clc.blackBright("C> ") + text,
				fileMessage: text,
			});
	}
}

const V = {
	private: "Лc",
	group: "Группа",
	supergroup: "Группа",
	channel: "КАНАЛ БЛИН",
};

on("modules.load", () => {
	const groupCommands = [];
	const groupAdminCommands = [];
	const privateCommands = [];
	const botAdminCommands = [];

	for (const command of Commands.filter((e) => e.info.prefix.includes("/"))) {
		if (command.info.hideFromHelpList) continue;
		const packedCommand = { command: command.info.name, description: command.info.description };

		if (["group", "all"].includes(command.info.target)) {
			if (command.info.permission === "all") groupCommands.push(packedCommand);
			if (command.info.permission === "group_admins") groupAdminCommands.push(packedCommand);
		}

		if (["private", "all"].includes(command.info.target)) privateCommands.push(packedCommand);

		if (command.info.permission === "bot_owner") botAdminCommands.push(packedCommand);
	}

	/**
	 *
	 * @param {import("telegraf/types").BotCommand[]} commands
	 * @param {import("telegraf/types").BotCommandScope} scope
	 */
	function addIfExists(commands, scope) {
		if (commands.length > 0) bot.telegram.setMyCommands(commands, { scope });
	}

	addIfExists(groupCommands, { type: "all_group_chats" });
	addIfExists(groupAdminCommands.concat(groupCommands), { type: "all_chat_administrators" });
	addIfExists(privateCommands, { type: "all_private_chats" });
	addIfExists(botAdminCommands.concat(privateCommands), { type: "chat", chat_id: Data.chatID.owner });

	bot.on("message", async (ctx, next) => {
		if (!hasText(ctx)) return next();
		const text = ctx.message.text;
		function reply(/** @type {string} */ text) {
			ctx.reply(text, {
				reply_to_message_id: ctx.message.message_id,
				allow_sending_without_reply: true,
			});
		}

		const command = Command.getCmd(text);

		if (command === "not_found" && ctx.chat.type === "private") {
			if (ctx.data.scene) return next();

			reply("Я не знаю, что тебе ответить. /help");
			Command.Log(ctx, ctx.data.user, "Текст");
			return;
		}
		if (typeof command !== "object") return next();

		if (
			ctx.data.scene &&
			!command.info.allowScene &&
			command.info.permission !== "bot_owner" &&
			ctx.chat.type === "private"
		)
			return reply(
				`В сцене ${ctx.data.scene.name} ${ctx.data.scene.state} вам доступны только ${u.langJoin(
					Commands.filter((e) => e.info.allowScene && e.info.permission !== "bot_owner").map(
						(e) => e.info.prefix[0] + e.info.name
					)
				)}`
			);

		const user_rigths = await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id);

		if (Command.cantUse(command, ctx, user_rigths)) return reply("Не здесь. /help");

		Command.Log(ctx, ctx.data.user);
		await safeRun(`Command`, () =>
			command.callback(ctx, text.replace(config.command.clear, ""), { ...ctx.data, user_rigths }, command)
		);
	});
});

/**======================ss
 *    Приветствие
 *========================**/
new Command(
	{
		name: "start",
		description: "Начало работы с ботом в лс",
		target: "private",
		hideFromHelpList: true,
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
		target: "all",
	},
	async (ctx) => {
		let c = false;
		const a = new Xitext();
		const rigths = await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id);

		for (const e of Commands.filter((e) => e.info.prefix.includes("/"))) {
			if (Command.cantUse(e, ctx, rigths) || e.info.hideFromHelpList) continue;
			if (!c) a.text(`Команды:\n`), (c = true);
			a.text(`  /${e.info.name}`);
			a.italic(` - ${e.info.description}\n`);
		}

		for (const e of Commands.filter((e) => !e.info.prefix.includes("/"))) {
			if (Command.cantUse(e, ctx, rigths)) continue;
			a.text(`  `);
			a.mono(`${e.info.prefix.length > 1 ? `[${e.info.prefix.join(", ")}]` : e.info.prefix[0]}${e.info.name}`);
			a.italic(` - ${e.info.description}\n`);
		}

		if (!a._.text) return ctx.reply("Команды недоступны");
		ctx.reply(...a._.build());
	}
);
