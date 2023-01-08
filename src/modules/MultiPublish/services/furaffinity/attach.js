import cheerio from "cheerio";
import fs from "fs/promises";
import fa from "furaffinity-api";
import { ENDPOINT } from "furaffinity-api/dist/Request.js";
import hooman from "hooman";
import { CookieJar } from "tough-cookie";

// const ENDPOINT = "https://www.furaffinity.net";

const submit_url = ENDPOINT + "/submit/";

void (async function main() {
	fa.Login(process.env.cookieA, process.env.cookieB);

	console.log(await fa.user());

	/** @type {import("got/dist/source/core/index.js").Agents} */
	let agent = {};
	// const cookieJar = new CookieJar();

	// cookieJar.setCookieSync(`a=${process.env.cookieA};`, ENDPOINT);
	// cookieJar.setCookieSync(`b=${process.env.cookieB};`, ENDPOINT);

	// const got = hooman.extend({
	// 	cookieJar,
	// 	headers: {
	// 		Connection: "keep-alive",
	// 	},
	// 	maxRedirects: 3,
	// });

	// const res = await got.get(submit_url, { agent });
	// fs.writeFile("logs/test.html", res.body);
	// const $ = cheerio.load(res.body);
	// console.log($("button"));
})();
