import { Client, Events, GatewayIntentBits } from "discord.js";
import { LeafyLogger } from "leafy-utils";
import { tables } from "../../lib/launch/database.js";
import { bot } from "../../lib/launch/telegraf.js";

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

	client.on(Events.VoiceStateUpdate, async (_, newState) => {
		const username = newState.member.user.username;
		const podvalId = tables.groups.values().find((e) => !!e.cache.podval)
			.static.id;

		if (!podvalId) return logger.error("No podvalid!");

		if (typeof newState.channelId === "string") {
			logger.log(username, "Joined!");
			await bot.telegram.sendMessage(podvalId, `+${username} войс чат в дс`);
		} else if (typeof newState.channelId === "object") {
			logger.log(username, "Left!");
			await bot.telegram.sendMessage(podvalId, `-${username} войс чат в дс`);
		}
	});
}
