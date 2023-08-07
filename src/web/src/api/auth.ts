import crypto from "crypto";
import { logger } from "../server/utils.js";

export const POST: Route<{ hash: string }> = (req) => {
	const user = hashIsValid(req.body?.hash)
	if (user) {
		logger.success("Auth from '" + user.username + "'!");
		return { valid: true, token: generateToken(user.id) };
	} else {
		logger.info("Invalid auth.");
		return { valid: false };
	}
};

function hashIsValid(telegramInitData: string) {
	const urlParams = new URLSearchParams(telegramInitData);
	const hash = urlParams.get("hash");
	urlParams.delete("hash");
	urlParams.sort();

	let dataCheckString = "";
	for (const [key, value] of urlParams.entries()) {
		dataCheckString += `${key}=${value}\n`;
	}
	dataCheckString = dataCheckString.slice(0, -1);

	const secret = crypto
		.createHmac("sha256", "WebAppData")
		.update(process.env.TOKEN ?? "");
	const calculatedHash = crypto
		.createHmac("sha256", secret.digest())
		.update(dataCheckString)
		.digest("hex");

	if (calculatedHash === hash) {
		try {
			const user = JSON.parse(urlParams.get("user"));
			if (tables.users.has(user.id)) return user
		} catch (e) {
			logger.error(e, urlParams.get("user"));
			return false;
		}
	} else return false;
}

const tokens: Record<string, {timestamp: number, id: string}> = {};

function generateToken(userid: string) {
	const timestamp = Date.now();
	const hash = crypto
		.createHash("sha256")
		.update(timestamp.toString())
		.digest("hex");
	tokens[hash] = {timestamp, id: userid};
	return hash;
}

export function tokenIsValid(token: string) {
	const data = tokens[token]
	if (!data || Date.now() - data.timestamp >= 1000 * 60 * 60 * 6) return false;
	return data.id
}

export const auth: Route = (req, res, next) => {
	const token = req.headers["authorization"];
	if (tokenIsValid(token)) return next();
	else if (!token)
		{res.writeHead(400, "No token on " + req.method + req.path).end();return}
	else {res.writeHead(400, "Invalid token on " + req.method + req.path).end();return}
};
