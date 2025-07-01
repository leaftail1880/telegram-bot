import { logger } from "../server/utils.js";

export { auth as default } from "./auth.ts";

export const POST: Route = (req, res) => {
	logger.info("Starting image upload...");
	const headers: Record<string, any> = { ...req.headers };
	delete headers["authorization"];
	delete headers["origin"];
	delete headers["host"];

	let body: Buffer;
	req.on("data", (chunk) =>
		body ? (body = Buffer.concat([body, chunk])) : (body = chunk)
	);
	req.on("end", async () => {
		const response = await fetch("https://telegra.ph/upload", {
			body,
			headers,
			method: "POST",
		});

		const result = await response.text();
		logger[response.ok ? "success" : "error"](
			"Upload done, status: ",
			response.status,
			response.statusText,
			"Result:",
			result
		);
		res.send(result);
	});
};
