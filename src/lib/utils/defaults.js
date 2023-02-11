import deepExtend from "deep-extend";

/**
 * @typedef {Record<string | number | symbol, any>} JSON_OBJECT
 */

/**
 *
 * @template {JSON_OBJECT} S
 * @template {JSON_OBJECT} D
 * @param {S} sourceObject
 * @param {D} defaultObject
 * @returns {S & D}
 */
export function setDefaults(sourceObject, defaultObject, noUnlink = false) {
	//                                           No another simplier way do delete links
	return deepExtend(noUnlink ? defaultObject : JSON.parse(JSON.stringify(defaultObject)), sourceObject);
}
/**
 *
 * @template {JSON_OBJECT} S
 * @param {S} sourceObject
 * @param {JSON_OBJECT} defaultObject
 * @returns {S}
 */
export function removeDefaults(sourceObject, defaultObject, visited = new WeakSet()) {
	/** @type {JSON_OBJECT} */
	const composed = {};

	for (const key in sourceObject) {
		const value = sourceObject[key];
		const defaultValue = defaultObject[key];
		const subSetDefaults = typeof defaultValue === "object" && defaultValue !== null && !visited.has(value);

		if (value === defaultValue) continue;

		if (subSetDefaults) {
			if (Array.isArray(defaultValue)) {
				const composedArray = removeDefaultsFromArray(value, defaultValue);
				if (composedArray.length < 1) continue;
				composed[key] = composedArray;
			} else {
				const composedSubObject = removeDefaults(value, defaultValue, visited);
				if (Object.keys(composedSubObject).length < 1) continue;
				composed[key] = composedSubObject;
			}
		} else composed[key] = value;
	}

	return composed;
}
/**
 *
 * @template T
 * @param {T[]} source
 * @param {T[]} defaults
 * @returns {T[]}
 */
function removeDefaultsFromArray(source, defaults) {
	const composed = [];

	for (const value of source) {
		if (defaults.includes(value)) continue;
		composed.push(value);
	}

	return composed;
}
