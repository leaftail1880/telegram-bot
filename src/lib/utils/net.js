import http from "http";
import fetch from "node-fetch";
import os from "os";
import config from "../../config.js";
import { Service } from "../Service.js";

/**
 * Opens server and returns server ip
 * @param {number} port
 * @param {(message: string) => string | Promise<string>} callback
 */
export function OpenServer(port, callback) {
	http
		.createServer((request, response) => {
			request.on("data", async (chunk) => {
				const message = await callback(chunk.toString());
				if (message) response.write(message);
				response.end();
			});
		})
		.listen(port);

	for (const faces of Object.values(os.networkInterfaces())) {
		if (typeof faces === "undefined") continue;

		for (const face of faces) {
			// Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
			// 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
			const familyV4Value = typeof face.family === "string" ? "IPv4" : 4;

			if (face.family === familyV4Value && !face.internal) {
				return `http://${face.address}:${port}`;
			}
		}
	}
}

/**
 * Sends message to another bot
 * @param {LoginInfo & ({
 *   message?: keyof Service["message"]
 *   version?: number[]
 * })} data
 */
export function SendBotMessage(data) {
	if (!data.message && !data.version) {
		throw new ReferenceError(
			"You must specify message or version in SendBotMessage!"
		);
	}

	return new Promise(async (resolve, reject) => {
		let response;
		try {
			const controller = new AbortController();
			const ip = data.ip;

			setTimeout(() => controller.abort(), config.MessageTimeout);
			delete data.ip;

			response = await fetch(ip, {
				signal: controller.signal,
				method: "PUT",
				body: data,
			});
		} catch (error) {
			return reject(error);
		}

		if (!response?.ok) return reject(response);
		if (!response.body) return reject("Got null body");
		response.body.on("data", (chunk) => resolve(chunk.toString()));
	});
}

/**
 * @typedef {{
 *   ip: string;
 *   passcode: string;
 * }} LoginInfo
 */
