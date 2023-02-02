import fetch from "node-fetch";
import http from "http";
import os from "os";

/**
 * Opens server and returns server ip
 * @param {number} port
 * @param {(message: string) => string | Promise<string>} callback
 */
export function OpenServer(port, callback) {
	http
		.createServer((incoming, response) => {
			incoming.on("data", async (chunk) => {
				const message = await callback(chunk.toString());
				response.write(message);
				response.end();
			});
		})
		.listen(port);

	const results = [];
	const nets = os.networkInterfaces();

	for (const faces of Object.values(nets)) {
		if (typeof faces === "undefined") continue;
		for (const face of faces) {
			// Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
			// 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
			const familyV4Value = typeof face.family === "string" ? "IPv4" : 4;

			if (face.family === familyV4Value && !face.internal) results.push(face.address);
		}
	}

	return "http://" + results[0] + ":" + port;
}

/**
 * Sends message to url
 * @param {string} url
 * @param {string} body
 */
export function SendMessage(url, body) {
	return new Promise(async (resolve, reject) => {
		let response;
		try {
			response = await fetch(url, { body, method: "PUT" });
		} catch (error) {
			return reject(error);
		}

		if (!response?.ok) return reject(response);
		if (!response.body) return reject("Got null body");
		response.body.on("data", (chunk) => resolve(chunk.toString()));
	});
}
