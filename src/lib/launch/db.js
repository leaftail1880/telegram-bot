import { SingleBar } from "cli-progress";
import { DatabaseManager, DatabaseTable, Github } from "leafy-db";
export * as leafy_db from "leafy-db";
import styles from "../styles.js";
import { removeDefaults, setDefaults } from "../utils/defaults.js";

export const database = new DatabaseManager({
	repository: Github(process.env.DB_REPO),
	token: process.env.DB_TOKEN,
});

export const tables = {
	/** @type {DatabaseTable<DB.User>} */
	users: database.table("users.json"),

	/** @type {DatabaseTable<DB.Group>} */
	groups: database.table("groups.json"),
	
	/** @type {DatabaseTable<Required<DB.Character>[]>} */
	ocs: database.table("modules/oc.json")
};

export async function setupDatabase() {
  tables.ocs._.on("beforeGet", (key, value) => (Array.isArray(value) ? value : []));
  
	tables.users._.on("beforeGet", (key, value) => {
		if (!value) return void 0;

		return setDefaults(value, { static: { id: Number(key) }, cache: {} }, true);
	});

	tables.users._.on("beforeSet", (key, value) => {
		return removeDefaults(value, { static: { id: Number(key) }, cache: {} });
	});

	tables.groups._.on("beforeGet", (key, value) => {
		/** @type {DB.Group} */
		const defaultGroup = {
			static: {
				id: Number(key),
				title: "<DEFAULT_TITLE>",
			},
			cache: {
				members: [],
				silentMembers: {},
			},
		};
		return setDefaults(value, defaultGroup, true);
	});

	tables.groups._.on("beforeSet", (key, value) => {
		return removeDefaults(value, {
			static: { id: Number(key) },
			cache: { silentMembers: {} },
		});
	});

	database.renderer = (postfix, total) => {
		const bar = new SingleBar({
			format: `${styles.progress.bar(`{bar}`)} {percentage}% - {value}/{total}`,
			barCompleteChar: styles.progress.completeChar,
			barIncompleteChar: styles.progress.incompleteChar,
			barsize: 150,

			hideCursor: true,
			clearOnComplete: true,
			// linewrap: true,
		});

		bar.start(total, 0);
		return bar;
	};
}
