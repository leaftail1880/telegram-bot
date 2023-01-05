/**
 *
 * @param {Object} sourceObject
 * @param {Object} defaultObject
 * @param {boolean} [onlyDefaultKeys]
 * @returns {Object}
 */
export function setDefaults(sourceObject, defaultObject, onlyDefaultKeys = true, visited = new WeakSet()) {
	const composed = {};

	for (const key in sourceObject) {
		if (!(key in defaultObject) && onlyDefaultKeys) continue;

		const value = sourceObject[key];
		const defaultValue = defaultObject[key];
		const subSetDefaults = typeof defaultValue === "object" && !Array.isArray(defaultValue) && !visited.has(value);

		composed[key] = subSetDefaults ? setDefaults(value, defaultValue) : value;
	}

	for (const key in defaultObject) {
		if (key in composed) continue;
		composed[key] = defaultObject[key];
	}

	return composed;
}

/**
 *
 * @param {Object} sourceObject
 * @param {Object} defaultObject
 * @param {boolean} [onlyDefaultKeys] If true, removing non-default keys
 * @returns {Object}
 */
export function removeDefaults(sourceObject, defaultObject, onlyDefaultKeys = true, visited = new WeakSet()) {
	const composed = {};

	for (const key in sourceObject) {
		//     Non-default key
		if (!(key in defaultObject) && onlyDefaultKeys) continue;

		const value = sourceObject[key];
		const defaultValue = defaultObject[key];
		const subSetDefaults = typeof defaultValue === "object" && !Array.isArray(defaultValue) && !visited.has(value);

		if (value === defaultValue && !subSetDefaults) continue;

		if (!subSetDefaults) {
			composed[key] = value;
		} else {
			const subDefaults = removeDefaults(value, defaultValue);

			if (Object.keys(subDefaults).length < 1) continue;
			composed[key] = subDefaults;
		}
	}

	return composed;
}
