import config from "../../config.js";
import { database } from "../../index.js";

/**
 * @template F, S, E
 * @param {Array<number>} array
 * @param {Array<number>} array2
 * @param {[F, S, E]} arg3
 * @returns {F | S | E}
 */
export function bigger(array, array2, [first, second, equal]) {
	for (let a = 0; a <= Math.max(array.length, array2.length); a++) {
		const [one, two] = [array[a] ?? 0, array2[a] ?? 0];

		if (one > two) return first;
		if (two > one) return second;
	}
	return equal;
}

/**
 * Обновляет data.v, data.versionMSG, data.isLatest и version
 * @param {ServiceData} data
 */
export function setDataType(data) {
	const raw_version = database.get(config.dbkey.version);
	const version = Array.isArray(raw_version) ? raw_version : [0, 0, 0];
	version.splice(3, 10);

	data.type = bigger(config.version, version, ["realese", "old", "work"]);

	if (data.type === "realese" && !data.development) database.set(config.dbkey.version, config.version);

	const ReadableType = types[data.type];

	data.readableVersion = `v${data.v} ${ReadableType}`;
	data.logVersion = `v${data.v}`;
}

/** @type {Record<ServiceData["type"], string>} */
const types = {
	old: "Старая",
	realese: "Релиз",
	work: "Рабочая",
};
