import clc from "cli-color";
import { SingleBar } from "cli-progress";
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
				.text(` ${data.publicVersion} ждет ответа...`)
				._.build(),
	},

	log: {
		start: () =>
			console.log(
				start_stop_lang.state(0, 4, `${data.development ? `${clc.yellow("DEV")} ` : ""}v${config.version.join(".")}`)
			),
		db: () => console.log(start_stop_lang.state(1, 4, "Fetching db data...")),
		session: () =>
			console.log(
				start_stop_lang.state(2, 4, `Type: ${clc.cyanBright(data.type)} Session: ${clc.cyanBright(data.session)}`)
			),
		modules: () => {
			console.log(start_stop_lang.state(3, 4, "Loading modules:"));
		},
		end: (/** @type {string[]} */ modules) =>
			console.log(
				start_stop_lang.state(
					4,
					4,
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
