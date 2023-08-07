import { Open } from "../web/router";
import { OCownerButton } from "./ocowner";
import { OCOwnersLoader, OCowners } from "./ocs";

export function MyOCs() {
	let id = Telegram.WebApp.initDataUnsafe?.user?.id?.toString() ?? "";
	const wrapper = section(
		() =>
			OCOwnersLoader.loaded
				? OCownerButton(id, i18n`My characters`)
				: i18n`Loading...`,
		button(span({ color: "green" }, "[+] "), i18n`Create`, {
			click$e: () =>
				Open(
					`/oc/${id}/${Object.keys(OCowners[id].ocs).length}`,
					new URLSearchParams("create")
				),
		})
	);

	OCOwnersLoader.onload(() => wrapper.update());
	return wrapper;
}
