import { Github, LeafyDBManager, LeafyDBTable } from "leafy-db";
import { removeDefaults, setDefaults } from "../utils/defaults.js";
export * as leafy_db from "leafy-db";

export const database = new LeafyDBManager({
	repository: Github(process.env.DB_REPO),
	token: process.env.DB_TOKEN,
});

export const tables = {
	/**
	 * @type {LeafyDBTable<DB.User>}
	 */
	users: database.table("users.json", {
		beforeGet(key, value) {
			if (!value) return void 0;

			return setDefaults(
				value,
				{ static: { id: Number(key) }, cache: {} },
				true
			);
		},
		beforeSet(key, value) {
			return removeDefaults(value, { static: { id: Number(key) }, cache: {} });
		},
	}),

	/**
	 * @type {LeafyDBTable<DB.Group>}
	 */
	groups: database.table("groups.json", {
		beforeSet(key, value) {
			return removeDefaults(value, {
				static: { id: Number(key) },
				cache: { silentMembers: {} },
			});
		},
		beforeGet(key, value) {
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
		},
	}),

	/**
	 * @type {LeafyDBTable<Required<DB.Character>[]>}
	 */
	ocs: database.table("modules/oc.json", {
		beforeGet: (key, value) => (Array.isArray(value) ? value : []),
	}),
};
