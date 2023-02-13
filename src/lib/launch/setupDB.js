import clc from "cli-color";
import { SingleBar } from "cli-progress";
import { clearLines, TypedBind } from "leafy-utils";
import { database, tables } from "../../index.js";
import styles from "../styles.js";
import { removeDefaults, setDefaults } from "../utils/defaults.js";
import { UpdateServer } from "./between.js";

export function setupDB() {
	tables.users._.on("beforeGet", (key, value) => {
		if (!value) return void 0;

		/** @type {DB.User} */
		const defaultUser = {
			// @ts-expect-error
			static: {
				id: Number(key),
			},
			cache: {},
		};
		return setDefaults(value, defaultUser, true);
	});
	tables.users._.on("beforeSet", (key, value) => {
		/** @type {DB.User} */
		const defaultUser = {
			// @ts-expect-error
			static: {
				id: Number(key),
			},
			cache: {},
		};
		return removeDefaults(value, defaultUser);
	});

	tables.groups._.on("beforeGet", (key, value) => {
		/** @type {DB.Group} */
		const defaultGroup = {
			// @ts-expect-error
			static: {
				id: Number(key),
			},
			cache: {
				members: [],
				silentMembers: {},
			},
		};
		return setDefaults(value, defaultGroup, true);
	});
	tables.groups._.on("beforeSet", (key, value) => {
		/** @type {DB.Group} */
		const defaultGroup = {
			// @ts-expect-error
			static: {
				id: Number(key),
			},
		};
		return removeDefaults(value, defaultGroup);
	});

	database.renderer = (postfix, total) => {
		const bar = new SingleBar({
			format: `${styles.progressBar(`{bar}`)} {percentage}% - {value}/{total}`,
			barCompleteChar: clc.greenBright("█"),
			barIncompleteChar: clc.blackBright("▒"),
			barsize: 150,

			hideCursor: true,
			clearOnComplete: true,
			// linewrap: true,
		});

		bar.start(total, 0);
		return bar;
	};
}
