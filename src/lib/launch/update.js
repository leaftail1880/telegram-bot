import config from "../../config.js";
import { database } from "../../index.js";
import { EventListener, TriggerEventListeners } from "../Class/Events.js";

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
export async function updateInfo(data) {
	const raw_version = database.get(config.dbkey.version);
	const dbversion = Array.isArray(raw_version) ? raw_version : [0, 0, 0];
	dbversion.splice(3, 10);

	data.type = bigger([config.version[0], config.version[1], config.version[2]], dbversion, ["realese", "old", "work"]);

	if (data.type === "realese" && !data.development) {
		EventListener("modules.load", 0, () => TriggerEventListeners("new.release", ""));

		database.set(config.dbkey.version, [config.version[0], config.version[1], config.version[2]]);
	}

	const d = translate_version[data.type];

	data.readableVersion = `v${data.v} ${d}`;
	data.logVersion = `v${data.v}`;
}

/** @type {Record<ServiceData["type"], string>} */
const translate_version = {
	old: "Старая",
	realese: "Релиз",
	work: "Рабочая",
};
