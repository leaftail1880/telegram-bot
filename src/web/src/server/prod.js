import dotenv from "dotenv";
import express from "express";
import path from "path";
import { applyRouters } from "virtual:vite-plugin-api:router";
import {
	SERVER_DIR,
	botApiLink,
	botHostExpose,
	isBrowserSupported,
	logger,
} from "./utils.js";

dotenv.config();
const {
	PORT = 8888,
	CLIENT_DIR = path.resolve(SERVER_DIR, "import.meta.env.CLIENT_DIR"),
} = process.env;

const server = express();
server.use((req, res, next) => {
	if (isBrowserSupported(req.headers["user-agent"])) return next();
	res.sendFile(path.join(CLIENT_DIR, "fallback.html"));
});
server.use(express.static(CLIENT_DIR, { acceptRanges: false }));
server.use(express.json());

async function main() {
	botHostExpose();
	await botApiLink();
	applyRouters(
		({ method, path, cb }) => {
			if (method in server) {
				logger.info(method.toUpperCase() + " " + path);
				// @ts-expect-error
				server[method](path, cb);
			} else {
				logger.error("Not support '" + method + "' in express");
			}
		},
		// @ts-expect-error Wrong plugin types.
		(cb) => {
			/** @type {Route} */
			return async (req, res, next) => {
				if (!res.writableEnded) {
					try {
						// @ts-expect-error Again
						let value = await cb(req, res, next);
						if (value && !(value instanceof Promise)) {
							res.send(value);
						}
					} catch (error) {
						logger.error("Internal Server " + error);
						res.writeHead(400, "Internal Server " + error).end();
					}
				}
			};
		}
	);

	server.use((req, res) => {
		res.sendFile(path.join(CLIENT_DIR, "index.html"));
	});

	server.listen(PORT, () => {
		logger.success(`Ready at http://localhost:${PORT}`);
	});
}

main();
