import chalk from "chalk";
import { default as eris, default as Eris } from "eris";
import { LeafyLogger } from "leafy-utils";
import { SocksProxyAgent } from "socks-proxy-agent";
import { tables } from "../../lib/launch/database.js";
import { bold, bot, fmt, link } from "../../lib/launch/telegraf.js";
import { Service } from "../../lib/Service.js";
import { u, util } from "../../lib/utils/index.js";
import { Command } from "../../lib/сommand.js";
const token = process.env.DISCORD_TOKEN;
const logger = new LeafyLogger({ prefix: "discord" });

if (!token) {
	logger.info("No DISCORD_TOKEN env, skipping...");
} else {
	const proxyUrl = process.env.DISCORD_SOCKS_PROXY_URL;
	const agent = proxyUrl ? new SocksProxyAgent(proxyUrl) : undefined;

	const client = eris(token, {
		intents: ["guilds", "guildVoiceStates"],
		rest: { agent },
		ws: { agent },
	});

	// When the client is ready, run this code (only once).
	// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
	// It makes some properties non-nullable.
	client.once("ready", () => {
		logger.success(`Ready! Logged in as ${client.user.username}`);
	});

	// Log in to Discord with your client's token
	client.connect();

	client.on("error", (error) => {
		logger.error(error);
		client.disconnect({ reconnect: true });
	});

	client.on("voiceChannelJoin", (member, channel) => {
		const telegram = getTelegramUser(member);
		if (telegram) message("Joined", "+", channel, telegram);
	});

	client.on("voiceChannelLeave", (member, channel) => {
		const telegram = getTelegramUser(member);
		if (telegram) message("Left", "-", channel, telegram);
	});

	/** @param {Eris.Member} member */
	function getTelegramUser(member) {
		const discordUsername = member.user.username;
		const groupId = tables.groups.values().find((e) => !!e.cache.podval)
			.static.id;
		const user = tables.users
			.values()
			.find((e) => e.cache.discordId === discordUsername);

		const name = user?.cache.nickname ?? discordUsername;
		const username = user?.static.nickname;

		if (!groupId) return logger.error("No groupId!");

		return { name, username, groupId, discordUsername };
	}

	/** @typedef {Exclude<ReturnType<typeof getTelegramUser>, void>} TelegramDiscordUser */

	/**
	 *
	 * @param {*} log
	 * @param {*} status
	 * @param {Eris.AnyVoiceChannel} channel
	 * @param {TelegramDiscordUser} telegram
	 */
	async function message(log = "Joined", status = "-", channel, telegram) {
		const members = channel.voiceMembers.size || 0;
		const channelName = channel.name;
		logger.log(
			chalk[status === "-" ? "redBright" : "greenBright"](
				`${status}${chalk.bold(telegram.name)} (${
					telegram.discordUsername
				}) ${log}! (${channelName}: ${chalk.bold(members)})`
			)
		);

		await bot.telegram.sendMessage(
			telegram.groupId,
			fmt`${status}${bold(
				telegram.username
					? link(telegram.name, u.httpsUserLink(telegram.username))
					: telegram.name
			)} голосовой чат в ${link(
				"дискорде",
				process.env.DISCORD_INVITE_URL ?? "https://discord.gg/"
			)} (${channelName}: ${bold(members.toString())})`,
			{ disable_web_page_preview: true }
		);
	}

	new Command(
		{
			name: "discordlink",
			description: "Привязывает аккаунт дискорда",
			permission: "all",
			target: "all",
		},
		async (ctx, newname, data) => {
			const user = data.user;
			const defaultName = "<Не установлен>";
			const currentname = user.cache.discordId
				? `'${user.cache.discordId}'`
				: defaultName;

			const reply = util.makeReply(ctx);

			// naming someone/asking for their name
			if (ctx.message.reply_to_message?.from) {
				const repl_user = tables.users.get(
					ctx.message.reply_to_message.from.id
				);
				if (!newname) return reply(repl_user.cache.discordId ?? defaultName);

				if (ctx.from.id !== Service.chat.owner)
					return reply(
						"Что? Ты не можешь сменить дискорд ник другого участника"
					);

				repl_user.cache.discordId = newname;
				tables.users.set(repl_user.static.id, repl_user);
				return reply(
					`Хиля назначил твой ник в дс на ${newname}. Ты можешь сменить ник в любой момент.`
				);
			}

			// asking for self name
			if (!newname) return reply(currentname);

			user.cache.discordId = newname;
			tables.users.set(ctx.from.id, user);
			reply(`Ник в дс ${currentname} сменен на '${newname}'`);
		}
	);
}
