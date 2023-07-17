export { auth as default } from "../auth.ts";

export const POST: Route<{ ownerid: string }> = (req, res, next) => {
  const ownerOCs = tables.ocs.get(req.body?.ownerid);

  return ownerOCs;
};
