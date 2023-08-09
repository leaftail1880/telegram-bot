import fs from "fs";
import path from "path";
import { FmtString } from "telegraf/format";
import { Service } from "../Service.js";
import { bot } from "../launch/telegraf.js";

export class Logger {
	constructor(fileName = "logs.txt") {
		const filePath = path.join("logs", fileName ?? "logs.txt");
		this.stream = fs.createWriteStream(filePath, "utf-8");
	}
	/**
	 * @param {{
	 * 	text?: FmtString;
	 *  textExtra?: import("telegraf/types").Convenience.ExtraReplyMessage
	 * 	consoleMessage?: string;
	 * 	fileMessage?: string
	 * }} log
	 */
	async log({ text, consoleMessage, fileMessage, textExtra }) {
		if (consoleMessage) console.log(consoleMessage);

		if (fileMessage)
			this.stream.write(
				`[${new Date().toLocaleString([], {
					hourCycle: "h24",
				})}] ${fileMessage}\r`
			);

		if (text) {
			if (textExtra) {
				textExtra.disable_web_page_preview ??= true;
			}
			bot.telegram.sendMessage(Service.chat.log, text, textExtra);
		}
	}
}
