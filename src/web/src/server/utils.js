import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import serveonet from "serveonet";
import url from "url";
import util from "util";

export const SERVER_DIR = url.fileURLToPath(new URL(".", import.meta.url));

export class Logger {
	constructor({ filePath = "logs/log.txt", prefix = "" }) {
		this.stream = fs.createWriteStream(filePath, "utf-8");
		this.prefix = prefix;
	}
	/**
	 * @param {{
	 * consoleMessage?: string,
	 * fileMessage?: string,
	 * color: keyof typeof Logger.colors
	 * }} message
	 */
	log({ consoleMessage, fileMessage, color = "yellow" }) {
		if (consoleMessage)
			console.log(
				`${this.prefix}${Logger.colors[color]}[${new Date().toLocaleString([], {
					hourCycle: "h24",
					timeStyle: "medium",
				})}]\x1b[0m ${consoleMessage}`
			);

		if (fileMessage)
			this.stream.write(`[${new Date().toLocaleString()}] ${fileMessage}\r`);
	}

	/**
	 * @param {...any} [context]
	 */
	error(...context) {
		const msg = util.format(...context);
		this.log({ color: "red", consoleMessage: msg, fileMessage: msg });
	}

	/**
	 *
	 * @param {...any} arg
	 */
	info(...arg) {
		const msg = util.format(...arg);
		this.log({ color: "cyan", fileMessage: msg, consoleMessage: msg });
	}

	/**
	 *
	 * @param {...any} arg
	 */
	success(...arg) {
		const msg = util.format(...arg);
		this.log({ color: "green", fileMessage: msg, consoleMessage: msg });
	}

	static colors = {
		black: "\x1b[30m",
		red: "\x1b[31m",
		green: "\x1b[32m",
		yellow: "\x1b[33m",
		blue: "\x1b[34m",
		magenta: "\x1b[35m",
		cyan: "\x1b[36m",
		white: "\x1b[37m",
		gray: "\x1b[90m",
		reset: "\x1b[0m",
	};
}

export const logger = new Logger({
	filePath: path.join(SERVER_DIR, "../../../../logs/web.txt"),
	prefix: Logger.colors.black + "[WEB]" + Logger.colors.reset,
});

export function botApiEnv() {
	dotenv.config({ path: "../../.env" });
}

export async function botApiLink() {
	const { tables, database } = await import(
		// @ts-ignore
		"../../../lib/launch/db.js"
	);

	// @ts-ignore
	const { util } = await import("../../../lib/utils/index.js");

	// @ts-ignore
	const { SubDB } = await import("../../../modules/Subscribe/db.js");

	if (database.closed) await database.connect();
	Object.assign(globalThis, {
		tables,
		database,
		util,
		SubDB,
	});
	logger.success("Bot api linked successfully!");
}

export function botHostExpose() {
	// ssh -R koboldie:80:localhost:8888 serveo.net  -o ServerAliveInterval=15
	serveonet({
		localHost: "localhost",
		localPort: 8888,
		remoteSubdomain: "koboldie",
		remotePort: 80,
		serverAliveInterval: 5,
		serverAliveCountMax: 1,
	})
		.on("connect", (connection) => {
			logger.success(
				"Forwarding to local port " +
					connection.localPort +
					", ssh pid: " +
					connection.pid
			);
		})
		.on("data", (args) => {
			logger.info(args);
		})
		.on("timeout", (connection) => {
			logger.error("Connection to " + connection.host + " timed out.");
		})
		.on("error", (event) => {
			logger.error(event.message);
		})
		.on("close", (event) => {
			logger.error("SSH exited with code " + event.code);
			event.onrestart = () => logger.info("Restarted");
		});
}

export function isBrowserSupported(nAgt = "") {
	/** @type {keyof typeof browsers | "Unknown"} */
	var browserName = "Unknown";
	var fullVersion = "0";
	var majorVersion = 0;
	var verOffset, ix;

	// In old Edge, the true version is after "Edge"
	if ((verOffset = nAgt.indexOf("Edge")) != -1) {
		browserName = "Edge";
		fullVersion = nAgt.substring(verOffset + 5);
	}
	// In new Edge, the true version is after "Edg"
	else if ((verOffset = nAgt.indexOf("Edg")) != -1) {
		browserName = "Edge";
		fullVersion = nAgt.substring(verOffset + 4);
	}
	// In Chrome, the true version is after "Chrome"
	else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
		browserName = "Chrome";
		fullVersion = nAgt.substring(verOffset + 7);
	}
	// In Safari, the true version is after "Safari" or after "Version"
	else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
		browserName = "Safari";
		fullVersion = nAgt.substring(verOffset + 7);
		if ((verOffset = nAgt.indexOf("Version")) != -1)
			fullVersion = nAgt.substring(verOffset + 8);
	}
	// In Firefox, the true version is after "Firefox"
	else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
		browserName = "Firefox";
		fullVersion = nAgt.substring(verOffset + 8);
	}

	// trim the fullVersion string at semicolon/space if present
	if ((ix = fullVersion.indexOf(";")) != -1)
		fullVersion = fullVersion.substring(0, ix);
	if ((ix = fullVersion.indexOf(" ")) != -1)
		fullVersion = fullVersion.substring(0, ix);

	majorVersion = parseInt("" + fullVersion, 10);
	if (isNaN(majorVersion)) {
		majorVersion = 0;
	}

	// console.log(
	// 	"\n" +
	// 		"Browser name  = " +
	// 		browserName +
	// 		"\n" +
	// 		"Full version  = " +
	// 		fullVersion +
	// 		"\n" +
	// 		"Major version = " +
	// 		majorVersion +
	// 		"\n" +
	// 		nAgt
	// );

	if (browserName !== "Unknown") {
		const minVer = browsers[browserName];
		return majorVersion >= minVer;
	} else {
		// Maybe parser error
		return true;
	}
}

const browsers = {
	Chrome: 87,
	Firefox: 78,
	Safari: 14,
	Edge: 88,
};
