import { Link } from "../web/router.ts";
import { LoadOCOwners, OCowners, type OCowner } from "./ocs.ts";

export async function LoadOwnerOCS(ownerid: string) {
	if (!OCowners[ownerid]) {
		await LoadOCOwners();
		if (!OCowners[ownerid]) throw new Error(i18n`Unknown owner`);
	}

	OCowners[ownerid].ocs = await api<OCowner["ocs"]>("oc/owner", {
		body: { ownerid },
		token: true,
	});
}

export function OCownerButton(ownerid: string) {
	const list = div(
		{
			style: "max-height: 0px;",
			class: "closable",
		},
		() =>
			Object.keys(OCowners[ownerid]?.ocs).length
				? OCList(OCowners[ownerid], ownerid)
				: [br(), a(i18n`Loading...`), br(), br()]
	);
	const wrapper = div(
		button(() => OCowners[ownerid].name, {
			class: "ocbutton",
			click$e() {
				wrapper.update();
				const l = list.element;
				l.style.maxHeight =
					l.style.maxHeight === "0px" ? l.scrollHeight + "px" : "0px";
				if (!Object.keys(OCowners[ownerid]?.ocs).length)
					LoadOwnerOCS(ownerid).then(() => {
						wrapper.update();
						const l = list.element;
						l.style.maxHeight =
							l.style.maxHeight !== "0px" ? l.scrollHeight + "px" : "0px";
					});
			},
		}),
		list
	);
	return wrapper;
}

function OCList(owner: OCowner, ownerid: string) {
	const ocs = [br()] as any[];
	for (const [i, e] of Object.entries(owner.ocs)) {
		ocs.push(Link(`/oc/${ownerid}/${i}`, e.name));
		ocs.push(br());
	}
	ocs.push(br());
	return ocs;
}
