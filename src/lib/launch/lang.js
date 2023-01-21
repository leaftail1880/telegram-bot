import clc from "cli-color";
import { data } from "../../index.js";
import { Xitext } from "../Class/Xitext.js";

export const service_lang = {
	launch: (/** @type {string} */ reason) => `⌬ ${data.logVersion} ${reason}`,
	stop: {
		terminate: () => `${data.logVersion} принудительно остановлена.`,
		old: () => `${data.logVersion} выключена как старая`,
		freeze: () => new Xitext().text(`${data.readableVersion} ждет ответа...`),
	},

	/**
	 *
	 * @param {number} total
	 * @returns
	 */
	state(total) {
		let c = 0;
		return (/** @type {string} */ m) => {
			console.log(clc.blackBright(`[${c}/${total}] `) + clc.white(m));
			c++;
		};
	},

	/**
	 *
	 * @param {string} [info]
	 * @param {string} [prefix]
	 * @returns
	 */
	start: (info = data.readableVersion.split(" ")[1], prefix = "⌬") =>
		new Xitext()
			.text(`${prefix} Кобольдя `)
			._.group(data.readableVersion.split(" ")[0])
			.url(null, `https://t.me/${data.me}`)
			.bold()
			._.group()
			.text(" ")
			.italic(info)
			._.build(),
};
