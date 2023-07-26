import { toArray } from "leafy-i18n";
import { EventLoader } from "./utils";

window.i18n = Object.assign(
	function (key: TemplateStringsArray, ...args: any[]) {
		if (!i18n.loaded) console.warn("[i18n] Not loaded");
		const k = key.join("\x01");
		const { db, locale } = i18n;
		return (db[k]?.[locale] ?? toArray(k))
			.map((e) => (typeof e === "number" ? args[e] : e))
			.join("");
	},
	{
		db: {},
		locale: Telegram?.WebApp?.initDataUnsafe?.user?.language_code ?? "en",
		codeLocale: "en",
	},
	EventLoader()
);

api<{
	c: string;
	db: Record<string, (number | string)[]>;
}>("i18n/" + i18n.locale).then(({ c: codeLocale, db }) => {
	i18n.codeLocale = codeLocale;
	i18n.db = Object.fromEntries(
		Object.entries(db).map((e) => {
			return [e[0], { [i18n.locale]: e[1] }];
		})
	);
	// @ts-expect-error
	i18n.emit();
});