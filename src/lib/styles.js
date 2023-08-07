import chalk from "chalk";

const highlight = chalk.cyanBright;

export default {
	highlight,
	number: chalk.yellowBright,
	error: chalk.white.bgRed,
	noConnection: chalk.redBright,
	connectionResolved: chalk.greenBright,
	progressBar: chalk.cyanBright,
	progress: {
		bar: chalk.cyanBright,
		completeChar: chalk.greenBright("█"),
		incompleteChar: chalk.blackBright("▒"),
	},

	loadError: chalk.redBright(" [-] "),
	load: highlight(" [+] "),
	/**
	 * @param {string} state
	 * @param {string} message
	 */
	state(state, message) {
		return chalk.blackBright(`[${state}] `) + chalk.white(message);
	},
};
