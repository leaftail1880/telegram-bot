import clc from "cli-color";

const highlight = clc.cyanBright;

export default {
	highlight,
	error: clc.white.bgRed,
	progressBar: clc.cyanBright,
	noConnection: clc.redBright,
	connectionResolved: clc.greenBright,
	loadError: clc.redBright(" [-] "),
	load: highlight(" [+] "),
	completeLoadChar: clc.greenBright("|"),
	incompleteLoadChar: clc.blackBright("|"),
};
