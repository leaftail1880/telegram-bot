import { database } from "../../../index.js";
import { Command } from "../../../lib/Class/Command.js";
import { util } from "../../../lib/Class/Utils.js";
import { Xitext } from "../../../lib/Class/Xitext.js";

new Command(
	{
		name: "db",
		description: "Cтарая база данных",
		permisson: 2,
	},
	async (ctx, args) => {
		switch (args[0]) {
			case "pairs":
				const a = await database.collectionAsync();
				console.log(a);
				util.sendSeparatedMessage(util.toStr(a, " "), ctx.reply);
				break;
			case "get":
				if (!args[1]) return ctx.reply("Нужно указать ключ (-db get <key>)");
				const get = await database.getActualData(args[1], true);
				console.log(get);
				util.sendSeparatedMessage(util.toStr(get, " "), (msg) => ctx.reply(...new Xitext().code(msg)._.build()));
				break;
			case "del":
				if (!args[1]) return ctx.reply("Нужно указать ключ (-db del <key>)");
				const del = (await database.delete(args[1])) + "";
				console.log(del);
				ctx.reply(del);
				break;
			case "keys":
				const keys = await database.keysAsync(),
					text = new Xitext().text("Ключи:");
				keys.sort().forEach((e) => {
					text.text("\n");
					text.mono(e);
				});
				console.log(keys.sort());
				ctx.reply(...text._.build());
				break;
			case "set":
				if (!args[1] || !args[2]) return ctx.reply("Нужно указать ключ и значение (-db set <key> <value>)");
				const set = await database.set(args[1], args[2]);
				console.log(set);
				ctx.reply("Успешно!");
				break;
			case "help":
			default:
				ctx.reply(
					...new Xitext()
						.text("Доступные методы:")
						.mono("\n pairs")
						.mono("\n get")
						.text(" <key>")
						.mono("\n set")
						.text(" <key> <value>")
						.mono("\n del")
						.text(" <key>")
						.mono("\n keys")
						._.build()
				);
		}
	}
);
