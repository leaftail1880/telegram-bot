import { database } from "../../index.js";
import { MultiMenu } from "../../lib/Class/Menu.js";
import { d } from "../../lib/Class/Utils.js";
import { Button } from "../../lib/Class/Xitext.js";
import { removeDefaults, setDefaults } from "../../lib/utils/defaults.js";

const gen_key = (id) => d.pn("Art", id);

/** @type {import("./types/Integrations.js").ArtIntegrations} */
const defaultUserArtInfo = {
	preferences: {},
	services: {
		telegram: {
			enabled: 0,
			id: null,
			tags: ["арт"],
			default_tags: [],
		},
		vk: {
			enabled: 0,
			token: null,
			id: null,
			tags: ["furry", "art", "фурри"],
			default_tags: [],
		},
		twitter: {
			enabled: 0,
			token: null,
			tags: ["furry", "furryfandom"],
			default_tags: ["furry"],
		},
	},
};

/**
 *
 * @param {string | number} id
 * @returns {Promise<import("./types/Integrations.js").ArtIntegrations>}
 */
export async function getUserArtInfo(id) {
	const data = await database.get(gen_key(id));

	return setDefaults(data, defaultUserArtInfo, false);
}

/**
 *
 * @param {string | number} id
 * @param {Promise<import("./types/Integrations.js").ArtIntegrations>} info
 */
export function setUserArtInfo(id, info) {
	return database.set(gen_key(id), removeDefaults(info, defaultUserArtInfo, false));
}

export const artMenu = new MultiMenu("art");

/**
 *
 * @param {string} text
 * @param {string} method
 * @param  {...string} [args]
 * @returns
 */
export const artButton = (text, method, ...args) => new Button(text).data(artMenu.link(method, ...args));
