import { Buttons } from "../web/router.ts";
import { SaveButton } from "../web/utils.ts";

export function Subscriptions() {
	type SubKey = import("../../../modules/Subscribe/index.js").SubKey;

	const keys: Record<SubKey, { button: string; text: string }> = {
		newMembers: {
			button: i18n`New members`,
			text: i18n`When new members joins`,
		},
		discordJoinOnce: { button: i18n`ds`, text: i18n`ds` },
	};

	let subs: Record<string, boolean> = {};
	api<Record<SubKey, boolean>>("subs", {
		token: true,
		body: { id: Telegram.WebApp.initDataUnsafe.user?.id },
	}).then((res) => {
		subs = res;
		wrapper.update();
	});

	const { saveButton, needSave } = SaveButton({
		status: "done",
		save: () =>
			api("subs", {
				method: "PATCH",
				token: true,
				body: { id: Telegram.WebApp.initDataUnsafe.user?.id, data: subs },
			}),
	});
	const wrapper = section(
		h1(i18n`Subscriptions`),
		Buttons.home,
		saveButton,
		() =>
			div(
				...Object.keys(subs).map((key) => {
					if (!(key in keys)) return console.log("Unknown subscription: ", key);
					return div(
						button(
							span("() ", {
								style: () => "color: " + (subs[key] ? "green" : "red"),
							}),
							keys[key as SubKey].button,
							{
								click$e() {
									subs[key] = !subs[key];
									needSave();
									wrapper.update();
								},
							}
						),
						p(keys[key as SubKey].text)
					);
				})
			)
	);

	return wrapper;
}
