import { data } from "../../index.js";
import { fmt, italic, link, bold } from "../Class/Xitext.js";
import styles from "../styles.js";

export const service_lang = {
	launch: (/** @type {string} */ reason) => `⌬ ${data.logVersion} ${reason}`,
	message: {
		terminate: () => `${data.logVersion} принудительно остановлена.`,

		old: () => `${data.logVersion} поняла, что устарела и выключилась.`,
		launchAsNew: () => ``,

		freeze: () =>
			fmt`${data.readableVersion} запросила статус другого сервера...`,
		development: () => `${data.readableVersion} перешла в режим разработки.`,
	},

	/**
	 * @param {number} total
	 */
	state(total) {
		let c = 0;
		return (/** @type {string} */ m) => {
			console.log(styles.state(`${c}/${total}`, m));
			c++;
		};
	},

	/**
	 * @param {string} [info]
	 * @param {string} [prefix]
	 */
	start: (info = data.readableVersion.split(" ")[1], prefix = "⌬") =>
		fmt`${prefix} Кобольдя ${link(
			bold(data.readableVersion.split(" ")[0]),
			"https://t.me/"
		)} ${italic(info)}`,
};
