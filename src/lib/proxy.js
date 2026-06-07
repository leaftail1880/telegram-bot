import './utils/env.js';

import { socksDispatcher } from "fetch-socks";
import { SocksProxyAgent } from "socks-proxy-agent";

const proxyUrl = process.env.DISCORD_SOCKS_PROXY_URL;
if (proxyUrl) console.log("USING PROXY", proxyUrl)

export const agent = proxyUrl ? new SocksProxyAgent(proxyUrl) : undefined;

export const dispatcher = proxyUrl
	? (() => {
			const { hostname, port } = new URL(proxyUrl);
			return socksDispatcher({ type: 5, host: hostname, port: parseInt(port) });
		})()
	: undefined;

/**
 *
 * @param {string | URL | Request} input
 * @param {RequestInit} init
 * @returns {Promise<Response>}
 */
export function fetchWithProxy(input, init = {}) {
	return fetch(input, {
		// @ts-expect-error Type version mismatch
		dispatcher,
		...init,
	});
}
