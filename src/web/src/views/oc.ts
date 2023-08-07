import type { RangeStatic } from "quill";
import "../web/load-image";
import "../web/load-image.scale";
import { TextEditor, localPhotoParse } from "../web/quill";
import { Buttons, CurrentRoute } from "../web/router";
import { SaveButton } from "../web/utils";
import { LoadOwnerOCS, OCowners } from "./ocs";

const fileSizeLimit = 5 * 1024 * 1024;
let image = "";

export function OC() {
	// This calls once
	let i: string;
	let ownerid: string;
	let root: HTMLDivElement;
	let state = "see" as "create" | "edit" | "see";
	let fallbackContent = i18n`Loading...`;
	let handleImage = () => Telegram.WebApp.showAlert("Wait untill full load");

	const editor = div({ class: "oc" }, () => {
		if (root && state !== "create") {
			root.innerHTML = OCowners[ownerid]?.ocs?.[i]?.description ?? "";
		} else root && (root.innerHTML = "");
	});

	const blocks = div(
		{ class: "tl_blocks" },
		div(
			{ class: "buttons" },
			button({
				click$e: () => handleImage(),
			})
		)
	) as unknown as HTMLDivElement;

	const headers: Record<typeof state, any> = {
		see: h1(
			i18n`Character `,
			() => OCowners[ownerid]?.ocs?.[i]?.name ?? fallbackContent.toLowerCase()
		),
		edit: h1(i18n`Edit`),
		create: h1(i18n`Create character`),
	};

	const { saveButton, needSave } = SaveButton({
		status: state === "create" ? "save" : "done",
		save: () => {
			const name = (
				wrapper.element.querySelector(".name-input") as HTMLInputElement
			).value;
			const description = quillE.root.innerHTML;
			return api("/oc/owner", {
				body: { name, description, i },
				method: "PUT",
				token: true,
			}).then(() => {
				console.log(ownerid, i, OCowners);
				OCowners[ownerid].ocs[i] = { description, name };
			});
		},
	});

	const wrapper = section(
		() => headers[state],
		Buttons.back,
		() =>
			state !== "see"
				? div(
						saveButton,
						input({
							class: "name-input",
							placeholder: i18n`Character name`,
							type: "text",
							input$e: (e: Event) => {
								if (
									state === "edit" &&
									(e.target as HTMLInputElement).value ===
										OCowners[ownerid]?.ocs?.[i]?.name
								)
									return;
								needSave();
							},
							value: () =>
								state === "edit" ? OCowners[ownerid]?.ocs?.[i]?.name : "",
						})
				  )
				: "",
		editor,
		blocks
	);

	TextEditor.onload(() => {
		console.log("Quill loaded");
		window.quillE = new Quill(editor.element, {
			readOnly: true,
			modules: {
				toolbar: [["link", "bold", "italic", "underline"]],
			},
			placeholder: i18n`Describe your character`,
			theme: "bubble",
		});
		let Block = Quill.import("blots/block");

		quillE.addContainer(blocks);
		quillE.on("text-change", () => {
			if (quillE.root.innerHTML !== OCowners[ownerid]?.ocs?.[i]?.description)
				needSave();
		});
		quillE.on(
			"editor-change",
			function (eventType: string, range: RangeStatic) {
				if (eventType !== "selection-change") return;
				if (!quillE.isEnabled()) return;
				if (range == null) return;
				let [block] = (quillE.scroll as any).descendant(Block, range.index);
				if (range.length === 0) {
					if (block != null && !block.domNode.innerText.trim().length) {
						let lineBounds = quillE.getBounds(range as any);

						blocks.style.top = `${lineBounds.top - lineBounds.height / 2}px`;
						blocks.classList.add("show");
					} else {
						blocks.classList.remove("show");
					}
				} else {
					blocks.classList.remove("show");
				}
			}
		);

		handleImage = () => {
			let fileInput = quillE.root.querySelector(
				"input.ql-image[type=file][data-status=ready]"
			) as HTMLInputElement;
			if (!fileInput) {
				fileInput = input({
					type: "file",
					accepts: "image/gif, image/jpeg, image/jpg, image/png, video/mp4",
					class: "ql-image",
					async change$e() {
						if (fileInput.files && fileInput.files[0]) {
							const file = await localPhotoParse(fileInput.files[0]);

							if (file.size > fileSizeLimit) {
								Telegram.WebApp.showAlert(
									i18n`Too large file (${(file.size / (1024 * 1024)).toFixed(
										2
									)}mb). Max size is 5mb`
								);
							}

							let reader = new FileReader();
							reader.onload = function (e) {
								let figure_value =
									typeof e.target!.result === "string"
										? getFigureValueByUrl(e.target!.result)
										: null;

								if (figure_value) {
									let range = quillE.getSelection(true);
									quillE.updateContents(
										(new (Quill.import("delta"))() as import("quill-delta"))
											.retain(range.index)
											.delete(range.length)
											.insert({ image: figure_value }),
										Quill.sources.USER
									);
								} else {
									Telegram.WebApp.showAlert(i18n`Invalid file format`);
								}
								fileInput.value = "";
								fileInput.setAttribute("data-status", "ready");
							};
							reader.readAsDataURL(file);
						}
					},
				}) as unknown as HTMLInputElement;
				quillE.root.appendChild(fileInput);
			}

			fileInput.setAttribute("data-status", "busy");
			fileInput.click();
		};

		root = quillE.root;
		wrapper.update();

		image = Quill.import("ui/icons").image;
		blocks.querySelector("div button")!.innerHTML = image;
	});

	// Calls on every navigation
	return (path: CurrentRoute) => {
		({ ownerid, i } = path.params);
		state = path.query.has("create")
			? "create"
			: ownerid === Telegram.WebApp.initDataUnsafe.user?.id?.toString()
			? "edit"
			: "see";
		if (window.quillE) quillE.enable(state !== "see");

		// Loading current owner
		if (!OCowners[ownerid]?.ocs?.[i] && !state) {
			LoadOwnerOCS(ownerid)
				.catch((error: Error) => {
					fallbackContent = i18n`Failed to fetch character: ${error.message}`;
				})
				.finally(() => wrapper.update());
		}
		wrapper.update();

		// Show "Loading..." state to user
		return wrapper;
	};
}

function getFigureValueByUrl(url: string) {
	let link = new URL(url);
	let match;
	if (
		link.protocol === "data:" &&
		(match = link.pathname.match(
			/^(image\/gif|image\/jpe?g|image\/png|video\/mp4);base64,(.*)$/
		))
	) {
		if (match[1].startsWith("video/")) {
			return { video: url };
		}
		return { image: url };
	}

	if (
		link.protocol === "https:" &&
		(match = link.pathname.match(/\.(jpe?g|png|gif|mp4)$/i))
	) {
		if (match[1] == "mp4") {
			return { video: url };
		}
		return { image: url };
	}
}
