import clc from "cli-color";

const highlight = clc.cyanBright;

export default {
	highlight,
	number: clc.yellowBright,
	error: clc.white.bgRed,
	noConnection: clc.redBright,
	connectionResolved: clc.greenBright,
	progressBar: clc.cyanBright,
	progress: {
		bar: clc.cyanBright,
		completeChar: clc.greenBright("█"),
		incompleteChar: clc.blackBright("▒"),
	},

	loadError: clc.redBright(" [-] "),
	load: highlight(" [+] "),
	/**
	 * @param {string} state
	 * @param {string} message
	 */
	state(state, message) {
		return clc.blackBright(`[${state}] `) + clc.white(message);
	},
};
