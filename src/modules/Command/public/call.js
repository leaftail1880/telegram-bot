import { Command } from "../../../lib/Class/Command.js";

new Command(
	{
		name: "call",
		description: "Созывает",
		permission: "group_admins",
		target: "group",
	},
	async (ctx, _, data) => {
		const group = data.group;

		if (!group || !("cache" in group)) throw new TypeError("Call cannot be called in non-group chats");

		await ctx.pinChatMessage(ctx.message.message_id, { disable_notification: false });
		setTimeout(() => ctx.unpinChatMessage(ctx.message.message_id), 5000);
	}
);
