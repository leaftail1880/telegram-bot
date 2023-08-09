import express from "express";
import { applyRouters, routeBase } from "virtual:vite-plugin-api:router";
import { bootstrapAPI, botApiEnv, botApiLink } from "./utils.js";

const server = express();
const router = express.Router();
server.use(routeBase, router);
router.use(express.json());

async function main() {
	botApiEnv();
	await botApiLink();
	await bootstrapAPI(router, applyRouters);
}

main();

export { server as handler };

