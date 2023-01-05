import * as fa from "furaffinity-api";
import path from "path";

const tmp_path = "src/modules/MultiPublish/tmp";
/**
 *
 * @param  {...string} paths
 * @returns
 */
function get_tmp(...paths) {
	return path.join(tmp_path, ...paths);
}

fa.login("", "");

void async function main() {
	const b = await fa.user();
	fa.Browse({ rating: fa.Rating.Adult });
	b.shinies;
	fa.Submission("50489502");
};
