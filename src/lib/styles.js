import clc from "cli-color";

export default {
	error: clc.white.bgRed,
	progressBar: clc.cyanBright,
	noConnection: clc.redBright,
	connectionResolved: clc.greenBright,
	load: clc.cyanBright(" [+] "),
	loadError: clc.redBright(" [-] "),
};
