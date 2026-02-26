import { SocksProxyAgent } from "socks-proxy-agent";

const proxyUrl = process.env.DISCORD_SOCKS_PROXY_URL;
export const agent = proxyUrl ? new SocksProxyAgent(proxyUrl) : undefined;
