import { Telegraph } from "better-telegraph";
import { LeafyDBTable } from "leafy-db";
import { database, tables } from "../../index.js";
import { u, util } from "./index.js";
import { pack, unpack } from "./pack.js";

/**
 * @type {LeafyDBTable<string>}
 */
const TELEGRAPH_DB = database.table("modules/telegraph.json");

/**
 * @param {string | number | DB.User} user
 */
export async function getAccount(user) {
	if (typeof user !== "object") user = tables.users.get(user);
	const id = user.static.id;
	let token;

	if (!TELEGRAPH_DB.has(id)) {
		const account = new Telegraph({
			author_name: util.getName(user),
			author_url: u.httpsUserLink(user.static.nickname),
			short_name: user.static.nickname,
		});

		await account.setupAccount();

		token = account.token;
		TELEGRAPH_DB.set(id, pack(process.env.E, account.token));
	}

	token = token ?? unpack(process.env.E, TELEGRAPH_DB.get(id));
	return new Telegraph({ accessToken: token });
}
