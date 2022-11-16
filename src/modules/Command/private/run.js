import { database } from "../../../index.js";
import { d, util } from "../../../lib/Class/Utils.js";

import { Command } from "../../../lib/Class/Cmd.js";
import { Button, Xitext } from "../../../lib/Class/Xitext.js";
import { Query } from "../../../lib/Class/Query.js";

new Query(
	{
		prefix: "run",
		name: "ban",
	},
	async (_, args, edit) => {
		await edit("Deleted: " + args[0]);
		database.delete(d.user(args[0]));
	}
);

/**
 *
 * @param {DB.User} user
 * @returns
 */
function genMessage(user) {
	const text = new Xitext();

	text.text(
		user.cache.nickname ??
			user.static.name ??
			user.static.nickname ??
			user.static.id
	);

	text.inlineKeyboard([
		new Button("Бан").data(d.query("run", "ban", user.static.id)),
	]);

	return text._.build();
}

new Command(
	{
		name: "run",
		description: "Запускает",
		permisson: 2,
	},
	async (ctx) => {
		let users = [
			5259746484, 1673719881, 1170295467, 1412895705, 834476079, 5289581250,
			5284387789, 703537310, 1003805117, 632727279, 1889421193, 5251340864,
			5496381993, 999294397, 1800480427, 1837758002, 1714490850, 999426404,
			5143830163, 1850035421, 5262803119, 5209173222, 233152398, 2118080564,
			5412494457, 914930751, 1412277363, 5268292097, 1886088185, 5450395066,
			1946407214, 2134585398, 1595732942, 5490060647, 1436266626, 5153502028,
			725957026, 1615403707, 5480663846, 1829856854, 5015834851, 2021682174,
		];

		for (const userID of await database.keys("User::*")) {
			/** @type {DB.User} */
			const user = await database.get(userID, true);

			if (!users.includes(user.static.id)) {
				await ctx.reply(...genMessage(user));
			}
		}

		for (const id of users) {
			try {
				await ctx.telegram.getChatMember(-1001644045395, id);
			} catch (e) {
				console.log(id);
				users = users.filter((e) => e !== id);
			}
		}
		console.log(users);
	}
);
