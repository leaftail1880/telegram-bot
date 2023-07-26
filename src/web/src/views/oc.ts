import type { RangeStatic } from "quill";
import { TextEditor, updatePhoto } from "../web/quill";
import { Buttons, PageNavigationData } from "../web/router";
import { LoadOwnerOCS } from "./ocowner";
import { OCowners } from "./ocs";
import "../web/load-image";

const fileSizeLimit = 5 * 1024 * 1024;

export function OC() {
	// This calls once
	let i: string;
	let ownerid: string;
	let quillRoot: HTMLDivElement;
	let fallbackContent = i18n`Loading...`;
	let handleImage = () => Telegram.WebApp.showAlert("Wait untill full load");

	const editor = div({ class: "oc" }, () => {
		// Make it update on navigation
		if (quillRoot) {
			quillRoot.innerHTML = OCowners[ownerid]?.ocs?.[i]?.description;
		}
		return fallbackContent;
	});
	const blocks = div(
		{
			class: "tl_blocks",
		},
		div(
			{ class: "buttons" },
			button({
				click$e() {
					handleImage();
				},
			})
		)
		// fusorjs typing are wrong, button
		// with click listener doesn't turns
		// element into dynamic component
	) as unknown as HTMLDivElement;

	const wrapper = section(
		h1(
			i18n`Character `,
			() => OCowners[ownerid]?.ocs?.[i]?.name ?? fallbackContent.toLowerCase()
		),
		Buttons.back,
		editor,
		blocks
	);

	TextEditor.onload(() => {
		console.log("Quill loaded");
		const quill = new Quill(editor.element, {
			readOnly: false,
			modules: {
				toolbar: [["link", "bold", "italic", "underline"]],
			},
			placeholder: "Compose an epic...",
			theme: "bubble",
		});
		let Block = Quill.import("blots/block");

		quill.addContainer(blocks);
		quill.on("editor-change", function (eventType: string, range: RangeStatic) {
			if (eventType !== "selection-change") return;
			if (!quill.isEnabled()) return;
			if (range == null) return;
			let [block] = (quill.scroll as any).descendant(Block, range.index);
			if (range.length === 0) {
				if (block != null && !block.domNode.innerText.trim().length) {
					let lineBounds = quill.getBounds(range as any);

					blocks.style.top = `${lineBounds.top - lineBounds.height / 2}px`;
					blocks.classList.add("show");
				} else {
					blocks.classList.remove("show");
				}
			} else {
				blocks.classList.remove("show");
			}
		});

		handleImage = () => {
			let fileInput = quill.root.querySelector(
				"input.ql-image[type=file][data-status=ready]"
			) as HTMLInputElement;
			if (!fileInput) {
				fileInput = input({
					type: "file",
					accepts: "image/gif, image/jpeg, image/jpg, image/png, video/mp4",
					class: "ql-image",
					async change$e() {
						if (fileInput.files && fileInput.files[0]) {
							const file = await updatePhoto(fileInput.files[0]);

							if (file.size > fileSizeLimit) {
								Telegram.WebApp.showAlert(
									i18n`Too large file (${((file.size / 1024) * 1024).toFixed(
										2
									)}mb). Max size is 5mb`
								);
							}

							let reader = new FileReader();
							reader.onload = function (e) {
								console.log(e.target!.result);
								let figure_value =
									typeof e.target!.result === "string"
										? getFigureValueByUrl(e.target!.result)
										: null;

								if (figure_value) {
									let range = quill.getSelection(true);
									quill.updateContents(
										(new (Quill.import("delta"))() as import("quill-delta"))
											.retain(range.index)
											.delete(range.length)
											.insert({ blockFigure: figure_value }),
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
				quill.root.appendChild(fileInput);
			}

			fileInput.setAttribute("data-status", "busy");
			fileInput.click();
		};

		quillRoot = quill.root;
		wrapper.update();
	});

	// Calls on every navigation
	return (path: PageNavigationData) => {
		({ ownerid, i } = path.params);

		// Loading current owner
		if (!OCowners[ownerid]?.ocs?.[i]) {
			LoadOwnerOCS(ownerid)
				.catch((error: Error) => {
					fallbackContent = i18n`Failed to fetch character: ${error.message}`;
				})
				.finally(() => wrapper.update());
		} else wrapper.update();

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
