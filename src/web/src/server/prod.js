import express from "express";
import path from "path";
import { applyRouters } from "virtual:vite-plugin-api:router";
import {
	SERVER_DIR,
	bootstrapAPI,
	botApiLink,
	botHostExpose,
	isBrowserSupported,
	logger,
} from "./utils.js";

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
	await botApiLink();
	botHostExpose();
	await bootstrapAPI(server, applyRouters, "global");

	server.use((_, res) => {
		res.sendFile(path.join(CLIENT_DIR, "index.html"));
	});

	server.listen(PORT, () => {
		logger.success(`Ready at http://localhost:${PORT}`);
	});
}

main();
