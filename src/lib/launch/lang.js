import { data } from "../../index.js";
import { bold, fmt, link } from "../Class/Xitext.js";
import styles from "../styles.js";

export const service_lang = {
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
	 * @param {string} [prefix]
	 */
	start: (prefix = "⌬") =>
		fmt`${prefix} Кобольдя ${link(bold(data.sv), "https://t.me/")}`,
};
