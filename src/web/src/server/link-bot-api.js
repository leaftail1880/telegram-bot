export async function devEnv() {
  (await import("dotenv")).config({ path: "../../.env" });
}

// Because we need to load env before patching
export async function load() {
  const { tables, database, setupDatabase } = await import(
    "../../../lib/launch/db.js"
  );

  setupDatabase();
  await database.connect();
  globalThis.tables = tables;
  console.log("[api] Bot api linked successfully!");
}
