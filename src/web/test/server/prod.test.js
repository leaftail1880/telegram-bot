// @ts-check
import { isBrowserSupported } from "../../src/server/link.js";

console.assert(
	isBrowserSupported(
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.82"
	),
	"Latest Edge should be supported"
);

console.assert(
	isBrowserSupported(
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0"
	),
	"Latest Firefox should be supported"
);

console.assert(
	isBrowserSupported(
		"Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15"
	),
	"Latest Safari should be supported"
);

console.assert(
	!isBrowserSupported(
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64; WebView/3.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19044"
	),
	"Old Edge should be not supported!"
);
