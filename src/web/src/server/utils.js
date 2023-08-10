import chalk from "chalk";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import serveonet from "serveonet";
import url from "url";
import util from "util";

export const SERVER_DIR = url.fileURLToPath(new URL(".", import.meta.url));

export class Logger {
	chalk = chalk;
	constructor({ filePath = "logs/log.txt", prefix = "" }) {
		this.stream = fs.createWriteStream(filePath, "utf-8");
		this.prefix = prefix;
	}
	/**
	 * @param {{
	 * consoleMessage?: string,
	 * fileMessage?: string,
	 * color: (...text: string[]) => string
	 * }} message
	 */
	log({ consoleMessage, fileMessage, color = chalk.yellow }) {
		if (consoleMessage)
			console.log(
				`\x1b[0m${new Date().toLocaleString([], {
					hourCycle: "h24",
					timeStyle: "medium",
				})} ${color(this.prefix)} ${consoleMessage}\x1b[0m`
			);

		if (fileMessage)
			this.stream.write(
				`[${new Date().toLocaleString()}] ${fileMessage.replace(
					/\x1b\[\d+m/g,
					""
				)}\r`
			);
	}

	/**
	 * @param {...any} [context]
	 */
	error(...context) {
		const msg = util.format(...context);
		this.log({ color: chalk.red, consoleMessage: msg, fileMessage: msg });
	}

	/**
	 *
	 * @param {...any} arg
	 */
	info(...arg) {
		const msg = util.format(...arg);
		this.log({ color: chalk.cyan, fileMessage: msg, consoleMessage: msg });
	}

	/**
	 *
	 * @param {...any} arg
	 */
	success(...arg) {
		const msg = util.format(...arg);
		this.log({
			color: chalk.greenBright,
			fileMessage: msg,
			consoleMessage: msg,
		});
	}
}

export const logger = new Logger({
	filePath: path.join(SERVER_DIR, "../../../../logs/web.txt"),
	prefix: chalk.bold("web"),
});

export function botApiEnv() {
	dotenv.config({ path: "../../.dev.env" });
}

export async function botApiLink() {
	const { tables, database } = await import(
		// @ts-ignore
		"../../../lib/launch/database.js"
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
		remoteSubdomain: process.env.SERVEO_SUBDOMAIN ?? "",
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

/**
 * @param {Express.Application} server
 * @param {import("virtual:vite-plugin-api:router")['applyRouters']} applyRouters
 */
export async function bootstrapAPI(server, applyRouters, to = "relative") {
	applyRouters(
		({ method, path, route, cb }) => {
			if (to !== "relative") route = path;
			if (method in server) {
				logger.info(method.toUpperCase() + " " + route);
				// @ts-expect-error
				server[method](route, cb);
			} else {
				logger.error("Method '" + method + "' is unsupported in express");
			}
		},
		/** @returns {Route} */
		(cb) =>
			// @ts-expect-error
			async (req, res, next) => {
				if (!res.writableEnded) {
					try {
						// @ts-expect-error
						let value = await cb(req, res, next);
						if (value && !(value instanceof Promise)) {
							res.send(value);
						}
					} catch (error) {
						logger.error("Internal Server " + error);
						res.writeHead(400, "Internal Server " + error).end();
					}
				}
			}
	);
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
