export { auth as default } from "../auth.ts";

export const POST: Route<{ ownerid: string }> = (req, res, next) => {
  const ownerOCs = Object.fromEntries(
		tables.ocs.get(req.body?.ownerid)?.entries?.() ?? [[]]
	);

  return ownerOCs;
};
