export { auth as default } from "./auth.ts";

export const POST: Route<{ id: string }> = (req) => {
	return SubDB.get(req.body?.id);
};

export const PATCH: Route<{ id: string; data: Record<string, boolean> }> = (
	req
) => {
	SubDB.set(req.body.id, req.body.data);

	return { valid: true };
};
