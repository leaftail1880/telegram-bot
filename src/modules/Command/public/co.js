import { Command } from "../../../lib/сommand.js";

new Command(
	{
		name: "co",
		description: "Считает",
		permission: "all",
	},
	(ctx, input) => {
		const [num1, num2] = input
			.split("\n")
			.map((e) => e.match(/\d+$/))
			.map(Number);

		ctx.reply((num1 - num2).toString());
	}
);
