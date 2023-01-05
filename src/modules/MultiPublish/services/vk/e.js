import { API, Upload } from "vk-io";

const api = new API({
	token: process.env.TOKEN,
});

const upload = new Upload({
	api,
});
