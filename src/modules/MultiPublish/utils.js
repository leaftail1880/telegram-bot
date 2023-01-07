import { database } from "../../index.js";
import { MultiMenu } from "../../lib/Class/Menu.js";
import { d } from "../../lib/Class/Utils.js";
import { Button } from "../../lib/Class/Xitext.js";
import { removeDefaults, setDefaults } from "../../lib/utils/defaults.js";

/** @type {import("./types/Integrations.js").ArtIntegrations} */
const defaultUserArtInfo = {
	preferences: {
		groups: [],
	},
	services: {
		telegram: {
			enabled: 0,
			id: null,
			tags: ["Скетч", "WIP"],
			default_tags: ["Арт"],
			lang: "ru",
		},
		vk: {
			enabled: 0,
			token: null,
			id: null,
			tags: ["furry", "art", "фурри"],
			default_tags: [],
			lang: "ru",
		},
		twitter: {
			enabled: 0,
			token: null,
			tags: ["furryfandom", "furryartist"],
			default_tags: ["furry"],
			lang: "en",
		},
	},
};

const gen_key = (/** @type {string | number} */ id) => d.pn("Art", id);

/**
 *
 * @param {string | number} id
 * @returns {Promise<import("./types/Integrations.js").ArtIntegrations>}
 */
export async function getUserArtInfo(id) {
	const data = await database.get(gen_key(id), true);

	return setDefaults(data, defaultUserArtInfo);
}

/**
 *
 * @param {string | number} id
 * @param {import("./types/Integrations.js").ArtIntegrations} info
 */
export function setUserArtInfo(id, info) {
	return database.set(gen_key(id), removeDefaults(info, defaultUserArtInfo));
}

export const artMenu = new MultiMenu("art");

/**
 *
 * @param {string} text
 * @param {string} method
 * @param  {...string | number} [args]
 * @returns
 */
export const artButton = (text, method, ...args) => new Button(text).data(artMenu.link(method, ...args));
