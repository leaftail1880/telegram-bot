import clc from "cli-color";
import { data } from "../../index.js";
import { fmt, Xitext } from "../Class/Xitext.js";

export const service_lang = {
	launch: (/** @type {string} */ reason) => `⌬ ${data.logVersion} ${reason}`,
	message: {
		terminate: () => `${data.logVersion} принудительно остановлена.`,

		old: () => `${data.logVersion} поняла, что устарела и выключилась.`,
		launchAsNew: () => ``,

		freeze: () => fmt`${data.readableVersion} запросила статус другого сервера...`,
		development: () => `${data.readableVersion} перешла в режим разработки.`,
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
			.url(null, `https://t.me/`)
			.bold()
			._.group()
			.text(" ")
			.italic(info)
			._.build(),
};
