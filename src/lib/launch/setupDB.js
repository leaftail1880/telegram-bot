import { SingleBar } from "cli-progress";
import { clearLines, TypedBind } from "leafy-utils";
import { database, tables } from "../../index.js";
import styles from "../styles.js";
import { removeDefaults, setDefaults } from "../utils/defaults.js";
import { UpdateServer } from "./between.js";

export function setupDB() {
	tables.users._.on("beforeGet", (key, value) => {
		/** @type {DB.User} */
		const defaultUser = {
			// @ts-expect-error
			static: {
				id: Number(key),
			},
			cache: {},
		};
		return setDefaults(value, defaultUser);
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
		};
		return setDefaults(value, defaultGroup);
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

	UpdateServer.renderer = (total) => {
		const bar = new SingleBar({
			format: `[${styles.progressBar(`{bar}`)}] {percentage}% - {value}/{total}`,
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
