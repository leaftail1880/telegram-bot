import { Component } from "@fusorjs/dom";
import { Buttons } from "../web/router.ts";
import { Authentication, EventLoader } from "../web/utils.ts";
import { MyOCs } from "./myocs.ts";
import { OCownerButton } from "./ocowner.ts";

export interface OCowner {
	name: string;
	ocs: Record<string, { description: string; name: string }>;
}

export const OCowners: Record<string, OCowner> = {};
export const OCOwnersLoader = EventLoader();
Authentication.onload(async () => {
	const newOwners = await api<Record<string, string>>("oc/owners", {
		token: true,
		method: "POST",
	});

	Object.keys(OCowners).forEach((e) => delete OCowners[e]);
	Object.entries(newOwners).forEach(([id, name]) => {
		OCowners[id] = { name, ocs: {} };
	});
	OCOwnersLoader.emit();
});

export async function LoadOwnerOCS(ownerid: string) {
	if (!OCowners[ownerid]) {
		await new Promise((resolve) => OCOwnersLoader.onload(resolve));
		if (!OCowners[ownerid]) throw new Error(i18n`Unknown owner`);
	}

	OCowners[ownerid].ocs = await api<OCowner["ocs"]>("oc/owner", {
		body: { ownerid },
		token: true,
	});
}

export function OCs() {
	const reloadButton = button(
		{
			click$e: () => {
				OCOwnersLoader.reload();
			},
		},
		i18n`Reload`
	);
	let ownerButtons: Component<any>[] = [reloadButton];
	const wrapper = section(
		h1(i18n`Characters`),
		Buttons.home,
		Authentication.token
			? MyOCs()
			: p(i18n`"My OCs" aren't avaible without authorization`),
		() => div(...ownerButtons)
	);

	OCOwnersLoader.onload(() => {
		ownerButtons = Object.keys(OCowners)
			.filter((e) => e !== Telegram.WebApp.initDataUnsafe.user?.id?.toString())
			.map((id) => OCownerButton(id));
		wrapper.update();
	});

	return wrapper;
}
