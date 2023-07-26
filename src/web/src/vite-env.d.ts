/// <reference types="vite/client" />

declare type i18nDB = import("leafy-i18n").i18nDB;

declare function i18n(t: TemplateStringsArray, ...args: any[]): string;
declare namespace i18n {
	let db: i18nDB;
	let locale: string;
	let codeLocale: string;
	let loaded: boolean;
	function onload(callback: Function): void;
}

declare function api<R, B extends null | undefined | Record<string, any> = any>(
	path: string,
	options?: {
		method?: string;
		body?: B;
		headers?: Record<string, string>;
		token?: boolean;
	}
): Promise<R>;

/**
 * Loads an image for a given File object.
 * @param file Blob object or image URL
 * @param callback Image load event callback
 * @returns  Object
 */
declare function loadImage(file: Blob | string, callback: Function, options: object):
	| HTMLImageElement
	| FileReader
	| Promise<HTMLImageElement | HTMLCanvasElement>;

declare const Telegram: import("@twa-dev/types").Telegram;
declare const Quill: typeof import("quill").Quill;
declare const lbr: HTMLBRElement;
declare const {
	a,
	abbr,
	address,
	area,
	article,
	aside,
	audio,
	b,
	base,
	bdi,
	bdo,
	blockquote,
	body,
	br,
	hbutton,
	button,
	canvas,
	caption,
	cite,
	code,
	col,
	colgroup,
	data,
	datalist,
	dd,
	del,
	details,
	dfn,
	dialog,
	div,
	dl,
	dt,
	em,
	embed,
	fieldset,
	figcaption,
	figure,
	footer,
	form,
	h1,
	h2,
	h3,
	h4,
	h5,
	h6,
	head,
	header,
	hgroup,
	hr,
	html,
	i,
	iframe,
	img,
	input,
	ins,
	kbd,
	label,
	legend,
	li,
	link,
	main,
	map,
	mark,
	menu,
	meta,
	meter,
	nav,
	noscript,
	object,
	ol,
	optgroup,
	option,
	output,
	p,
	picture,
	pre,
	progress,
	q,
	rp,
	rt,
	ruby,
	s,
	samp,
	script,
	section,
	select,
	slot,
	small,
	source,
	span,
	strong,
	style,
	sub,
	summary,
	sup,
	table,
	tbody,
	td,
	template,
	textarea,
	tfoot,
	th,
	thead,
	time,
	title,
	tr,
	track,
	u,
	ul,
	hvar,
	video,
	wbr,
}: typeof import("@fusorjs/dom/html");
