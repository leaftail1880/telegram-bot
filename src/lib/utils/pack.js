/**
 * @param {string} s
 * @param {string} text
 */
export function pack(s, text) {
	return text
		.split("")
		.map((c) => c.charCodeAt(0))
		.map((c) =>
			s
				.split("")
				.map((c) => c.charCodeAt(0))
				.reduce((a, b) => a ^ b, c)
		)
		.map((n) => ("0" + Number(n).toString(16)).slice(-2))
		.join("");
}

/**
 * @param {string} s
 * @param {string} encoded
 */
export function unpack(s, encoded) {
	return encoded
		.match(/.{1,2}/g)
		.map((c) => parseInt(c, 16))
		.map((c) =>
			s
				.split("")
				.map((c) => c.charCodeAt(0))
				.reduce((a, b) => a ^ b, c)
		)
		.map((c) => String.fromCharCode(c))
		.join("");
}
