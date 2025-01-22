import chalk from "chalk";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { LeafyLogger } from "leafy-utils";
import { tables } from "../../lib/launch/database.js";
import { bold, bot, fmt, link } from "../../lib/launch/telegraf.js";
import { Service } from "../../lib/Service.js";
import { util } from "../../lib/utils/index.js";
import { Command } from "../../lib/сommand.js";

const token = process.env.DISCORD_TOKEN;
const logger = new LeafyLogger({ prefix: "discord" });

if (!token) {
	logger.info("No DISCORD_TOKEN env, skipping...");
} else {
	const client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
	});

	// When the client is ready, run this code (only once).
	// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
	// It makes some properties non-nullable.
	client.once(Events.ClientReady, (readyClient) => {
		logger.success(`Ready! Logged in as ${readyClient.user.tag}`);
	});

	// Log in to Discord with your client's token
	client.login(token);

	client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
		const username = newState.member.user.username;
		const podvalId = tables.groups.values().find((e) => !!e.cache.podval)
			.static.id;
		const name =
			tables.users.values().find((e) => e.cache.discordId === username)?.cache
				.discordId ?? username;

		if (!podvalId) return logger.error("No podvalid!");

		async function message(log = "Joined", status = "-") {
			const channel = newState.channel || oldState.channel;
			const members = channel?.members.size || 0;
			const channelName = channel.name;
			logger.log(
				chalk[status === "-" ? "redBright" : "greenBright"](
					`${status}${chalk.bold(
						name
					)} (${username}) ${log}! (${channelName}: ${chalk.bold(members)})`
				)
			);

			await bot.telegram.sendMessage(
				podvalId,
				fmt`${status}${bold(name)} голосовой чат в ${link(
					"дискорде",
					process.env.DISCORD_INVITE_URL ?? "https://discord.gg/"
				)} (${channelName}: ${bold(members.toString())})`,
				{ disable_web_page_preview: true }
			);
		}

		if (oldState.channelId === null && typeof newState.channelId === "string") {
			await message("Joined", "+");
		} else if (
			newState.channelId === null &&
			typeof oldState.channelId === "string"
		) {
			await message("Left", "-");
		}
	});

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
