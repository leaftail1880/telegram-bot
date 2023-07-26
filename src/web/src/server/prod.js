import dotenv from "dotenv";
import express from "express";
import { applyRouters } from "virtual:vite-plugin-api:router";
import { isBrowserSupported, logger } from "./utils.js";

dotenv.config();
const { PORT = 3000, CLIENT_DIR = "import.meta.env.CLIENT_DIR" } = process.env;

const server = express();
server.use((req, res, next) => {
	if (isBrowserSupported(req.headers["user-agent"])) return next();

	const newURL = new URL(req.url, `http://${req.headers.host}`);
	newURL.pathname = "fallback.html";
	req.url = newURL.href;
	return next();
});
server.use(express.static(CLIENT_DIR));
server.use(express.json());
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
					if (value) {
						res.send(value);
					}
				} catch (error) {
					logger.error("Internal server error: " + error);
					res.writeHead(400, "Internal server error: " + error).end();
				}
			}
		};
	}
);

server.listen(PORT, () => {
	console.log(`Ready at http://localhost:${PORT}`);
});
