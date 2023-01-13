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
 * Обновляет всё
 * @param {ServiceData} data
 */
export async function updateInfo(data) {
	await updateSession(data);
	await updateVisualVersion(data);
}

/**
 * Обновляет session
 * @param {ServiceData} data
 */
async function updateSession(data) {
	if (!(await database.has(config.dbkey.session))) {
		await database.set(config.dbkey.session, 0);
	}

	await database.increase(config.dbkey.session, 1);

	data.session = await database.getActualData(config.dbkey.session, true);
}

/**
 * Обновляет data.v, data.versionMSG, data.isLatest и version
 * @param {ServiceData} data
 */
async function updateVisualVersion(data) {
	// Получаем данные
	let session = data.session;

	/**
	 * @type {number[]}
	 */
	const dbversion = (await database.getActualData(config.dbkey.version, true)) ?? [0, 0, 0];
	dbversion.splice(3, 10);

	// Сравниваем версии
	data.type = bigger([config.version[0], config.version[1], config.version[2]], dbversion, ["realese", "old", "work"]);

	// Если версия новая
	if (data.type === "realese" && !data.development) {
		EventListener("modules.load", 0, () => TriggerEventListeners("new.release", ""));

		// Прописываем ее в базе данных
		database.set(config.dbkey.version, [config.version[0], config.version[1], config.version[2]]);
	}

	// Записываем значения
	data.v = `${config.version.join(".")}.x${`${session}`.padStart(5, "0")}`;

	const d = translate_version[data.type];

	data.publicVersion = `v${data.v} ${d}`;
	data.logVersion = `v${data.v}`;
}

/** @type {Record<ServiceData["type"], string>} */
const translate_version = {
	old: "Старая",
	realese: "Релиз",
	work: "Рабочая",
};
