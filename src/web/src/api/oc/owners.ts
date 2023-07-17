export { auth as default } from "../auth.ts";

// TODO Maybe hash users ids

export const POST: Route = (req, res, next) => {
  const ocOwners = tables.ocs
    .keys()
    .map((id) => [id, util.getName(null, null, id)]);

  return ocOwners
};
