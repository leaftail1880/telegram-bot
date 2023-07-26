import { Component } from "@fusorjs/dom";
import { Buttons } from "../web/router.ts";
import { OCownerButton } from "./ocowner.ts";

export interface OCowner {
	name: string;
	ocs: Record<string, { description: string; name: string }>;
}

export const OCowners: Record<string, OCowner> = {};

export async function LoadOCOwners() {
	const newOwners = await api<Record<string, string>>("oc/owners", {
		token: true,
	});

	Object.keys(OCowners).forEach((e) => delete OCowners[e]);
	Object.entries(newOwners).forEach(([id, name]) => {
		OCowners[id] = { name, ocs: {} };
	});
}

export function OCs() {
	const reloadButton = button({ click$e: LoadOCOwners }, i18n`Reload`);
	let ownerButtons: Component<any>[] = [reloadButton];
	console.log(Buttons.home);
	const wrapper = section(h1(i18n`Characters`), Buttons.home, () =>
		div(...ownerButtons)
	);

	LoadOCOwners().then(() => {
		ownerButtons = Object.keys(OCowners).map(OCownerButton);
		wrapper.update();
	});

	return wrapper;
}
