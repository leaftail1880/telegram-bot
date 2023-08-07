import express from "express";
import { applyRouters, routeBase } from "virtual:vite-plugin-api:router";
import { logger, botApiEnv, botApiLink } from "./utils.js";

const handler = express();
const router = express.Router();
handler.use(express.json());
handler.use(routeBase, router);

async function main() {
	botApiEnv();
	await botApiLink();
	applyRouters(
		({ method, route, cb }) => {
			if (method in router) {
				logger.info(method.toUpperCase() + " " + route);
				// @ts-expect-error
				router[method](route, cb);
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
}

main();

export { handler };
