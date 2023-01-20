import { SingleBar } from "cli-progress";
import { clearLines, TypedBind } from "leafy-utils";
import styles from "../styles.js";
import { removeDefaults, setDefaults } from "../utils/defaults.js";
import { tables, DBManager } from "../../index.js";

export function setupDB() {
	tables.users._.beforeGet = (key, value) => {
		/** @type {DB.User} */
		const defaultUser = {
			// @ts-expect-error
			static: {
				id: Number(key),
			},
			cache: {},
		};
		return setDefaults(value, defaultUser);
	};
	tables.users._.beforeSet = (key, value) => {
		/** @type {DB.User} */
		const defaultUser = {
			// @ts-expect-error
			static: {
				id: Number(key),
			},
			cache: {},
		};
		return removeDefaults(value, defaultUser);
	};

	tables.groups._.beforeGet = (key, value) => {
		/** @type {DB.Group} */
		const defaultGroup = {
			// @ts-expect-error
			static: {
				id: Number(key),
			},
		};
		return setDefaults(value, defaultGroup);
	};
	tables.groups._.beforeSet = (key, value) => {
		/** @type {DB.Group} */
		const defaultGroup = {
			// @ts-expect-error
			static: {
				id: Number(key),
			},
		};
		return removeDefaults(value, defaultGroup);
	};

	DBManager.renderer = (postfix, total) => {
		const bar = new SingleBar({
			format: `[${styles.progressBar(`{bar}`)}] {percentage}% - {value}/{total} ${postfix}`,
			barCompleteChar: "#",
			barIncompleteChar: "..",
			hideCursor: true,
		});

		bar.start(total, 0);
		const originalStop = TypedBind(bar.stop, bar);
		bar.stop = () => {
			originalStop();
			clearLines(-1);
		};
		return bar;
	};
}
