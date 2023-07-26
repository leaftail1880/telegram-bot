import { Buttons } from "../web/router.ts";

export function Subscriptions() {
	type SubKey = import("../../../modules/Subscribe/db.js").SubKey;

	const keys: Record<SubKey, { button: string; text: string }> = {
		newMembers: {
			button: i18n`New members`,
			text: i18n`When new members joins`,
		},
		chatEvents: {
			button: i18n`Chat events`,
			text: i18n`Chat events like games, gartic etc`,
		},
		botUpdates: { button: i18n`Bot updates`, text: i18n`On new bot version` },
	};

	let subs: Record<string, boolean> = {};

	async function fetchSubscriptions() {
		subs = await api<Record<SubKey, boolean>>("subs", {
			token: true,
			body: { id: Telegram.WebApp.initDataUnsafe.user?.id },
		});

		wrapper.update();
	}

	fetchSubscriptions();

	const statuses = {
		save: i18n`Save!`,
		saving: i18n`Saving...`,
		done: i18n`Saved!`,
		error: i18n`Error, retry again.`,
	};
	let status: keyof typeof statuses = "done";

	const wrapper = section(
		h1(i18n`Subscriptions`),
		Buttons.home,
		button(
			{ disabled: () => status === "done" },
			() =>
				status === "save"
					? span("(!) ", { class: "hint", style: "color: yellow" })
					: "",
			() => statuses[status],
			{
				async click$e() {
					status = "saving";
					wrapper.update();
					api("subs", {
						method: "PATCH",
						token: true,
						body: { id: Telegram.WebApp.initDataUnsafe.user?.id, data: subs },
					})
						.then(() => {
							status = "done";
						})
						.catch(() => {
							status = "error";
						})
						.finally(() => {
							wrapper.update();
						});
				},
			}
		),
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
									status = "save";
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
