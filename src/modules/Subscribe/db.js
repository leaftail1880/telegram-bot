import { LeafyDBTable } from "leafy-db";
import { database } from "../../lib/launch/database.js";
import { removeDefaults, setDefaults } from "../../lib/utils/defaults.js";

/**
 * @type {Record<string, boolean>}
 */
export const DefaultSubs = {
	newMembers: true,
	chatEvents: true,
	botUpdates: false,
};

/**
 * @type {LeafyDBTable<typeof DefaultSubs>}
 */
export const SubDB = database.table("modules/subs.json", {
	beforeGet: (key, value) => setDefaults(value, DefaultSubs),
	beforeSet: (key, value) => removeDefaults(value, DefaultSubs),
});

/**
 * @typedef {"newMembers" | "chatEvents" | "botUpdates"} SubKey
 */
