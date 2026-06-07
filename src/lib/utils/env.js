import { existsSync } from "fs";

export const ENV_PATH = process.argv[2] ?? ".env";
if (existsSync(ENV_PATH)) process.loadEnvFile(ENV_PATH);
else console.warn("No env file exists at", ENV_PATH);
