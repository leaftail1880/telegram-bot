import config from "../../config.js";
import { Xitext } from "../Class/Xitext.js";
import { data } from "../SERVISE.js";

export const start_stop_lang = {
	logLaunch: (reason) => `⌬ ${data.logVersion} ${reason}`,
	stop: {
		terminate: () => `${data.logVersion} принудительно остановлена.`,
		old: () => `${data.logVersion} выключена как старая`,
		freeze: () =>
			new Xitext()._.group(`$`)
				.url("https://t.me")
				.bold()
				._.group()
				.text(` ${data.publicVersion} заморожена.`)
				._.build(),
	},

	log: {
		start: () => console.log(`${data.development ? "DEV " : ""}v${config.version.join(".")}`),
		end: (modules) =>
			console.log(
				`${((Date.now() - data.start_time) / 1000).toFixed(2)} sec, Session: ${data.session}, Modules:${modules
					.map((e) => `\n [+] ${e}`)
					.join("")}`
			),
	},

	/**
	 *
	 * @param {string} [info]
	 * @param {string} [prefix]
	 * @returns
	 */
	start: (info = data.publicVersion.split(" ")[1], prefix = "⌬") =>
		new Xitext()
			.text(`${prefix} Кобольдя `)
			._.group(data.publicVersion.split(" ")[0])
			.url(null, `https://t.me/${data.me}`)
			.bold()
			._.group()
			.text(" ")
			.italic(info)
			._.build(),
};
