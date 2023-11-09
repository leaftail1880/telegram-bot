import { defineConfig } from "vite";
import { pluginAPI } from "vite-plugin-api";


// https://vitejs.dev/config/
export default defineConfig({
	build: {
		minify: true,
		outDir: "dist/client",
		rollupOptions: {
			external: [
				"express",
				"dotenv",
				"chalk",
				"quill",
				"serveonet",
				"../../../modules/Subscribe/db.js",
				"../../../lib/utils/index.js",
				"../../../lib/launch/database.js",
			],
		},
		modulePreload: { polyfill: false },
	},
	plugins: [
		pluginAPI({
			moduleId: "virtual:custom",
			outDir: "dist/server",
			minify: false,
			entry: "./src/server/prod.js",
			handler: "./src/server/dev.js",
			mapper: {
				default: "use",
				GET: "get",
				POST: "post",
				PUT: "put",
			},
		}),
	],
});
