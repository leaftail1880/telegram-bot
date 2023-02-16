import { SingleBar } from "cli-progress";
import { database, tables } from "../../index.js";
import styles from "../styles.js";
import { removeDefaults, setDefaults } from "../utils/defaults.js";

export function setupDB() {
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
