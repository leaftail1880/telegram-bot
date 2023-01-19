import clc from "cli-color";
import config from "../../config.js";
import { data } from "../../index.js";
import { Xitext } from "../Class/Xitext.js";

export const service_lang = {
	launch: (/** @type {string} */ reason) => `⌬ ${data.logVersion} ${reason}`,
	stop: {
		terminate: () => `${data.logVersion} принудительно остановлена.`,
		old: () => `${data.logVersion} выключена как старая`,
		freeze: () => new Xitext().text(`${data.readableVersion} ждет ответа...`)._.build(),
	},

	s: {
		start: () =>
			console.log(
				service_lang.state(0, 5, `${data.development ? `${clc.yellow("DEV")} ` : ""}v${config.version.join(".")}`)
			),
		db: () => console.log(service_lang.state(1, 5, "Fetching db data...")),
		session: () => console.log(service_lang.state(2, 5, `Type: ${clc.cyanBright(data.type)}`)),
		middlewares: () => console.log(service_lang.state(3, 5, "Loading middlewares")),
		modules: () => console.log(service_lang.state(4, 5, "Loading modules")),
		end: () =>
			console.log(
				service_lang.state(
					5,
					5,
					`Ready to work in ${clc.cyanBright(((Date.now() - data.start_time) / 1000).toFixed(2))}s`
				)
			),
	},

	/**
	 *
	 * @param {number} s1
	 * @param {number} s2
	 * @param {string} m
	 * @returns
	 */
	state: (s1, s2, m) => clc.blackBright(`[${s1}/${s2}] `) + clc.white(m),

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
