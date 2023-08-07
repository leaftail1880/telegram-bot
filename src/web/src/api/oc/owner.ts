import { tokenIsValid } from "../auth.ts";

export { auth as default } from "../auth.ts";

export const POST: Route<{ ownerid: string }> = (req, res, next) => {
	const ownerOCs = Object.fromEntries(
		tables.ocs.get(req.body?.ownerid)?.entries?.() ?? [[]]
	);

	return ownerOCs;
};

export const PUT: Route<{ name: string; description: string; i: number }> = (
	req,
	res
) => {
	const userid = tokenIsValid(req.headers["authorization"]);
	if (!userid) {
		res.writeHead(400, "Unauthorized");
		return;
	}
	const { data, save } = tables.ocs.work(userid);
	data[req.body.i as number] = {
		name: req.body.name,
		description: req.body.description,
	};
	save();
	return { valid: true };
};
