import { CallbackService, VK as $VK } from "vk-io";
import { DirectAuthorization, officialAppCredentials } from "@vk-io/authorization";

const callbackService = new CallbackService();
const VK = new $VK({
	token: "",
});

const direct = new DirectAuthorization({
	callbackService,

	scope: "all",

	// Direct authorization is only available for official applications
	...officialAppCredentials.android, // { clientId: string; clientSecret: string; }

	// Or manually provide app credentials
	// clientId: process.env.CLIENT_ID,
	// clientSecret: process.env.CLIENT_SECRET,

	login: process.env.LOGIN,
	password: process.env.PASSWORD,

	apiVersion: "5.131",
});

async function run() {
	const response = await direct.run();

	console.log("Token:", response.token);
	console.log("Expires:", response.expires);

	console.log("Email:", response.email);
	console.log("User ID:", response.userId);

	VK.api;
}

run().catch(console.error);
