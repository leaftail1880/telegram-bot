import serveonet from "serveonet";
/**
 * @typedef {import("../../src/server/types.js")} a
 */

export function botHostExpose() {
	// ssh -R koboldie:80:localhost:8888 serveo.net  -o ServerAliveInterval=15
	serveonet({
		localHost: "localhost",
		localPort: 8888,
		remoteSubdomain: "koboldie",
		remotePort: 80,
		serverAliveInterval: 60,
		serverAliveCountMax: 3,
	})
		.on("error", (err) => {
			console.log(err);
		})
		.on("timeout", (connection) => {
			console.log("Connection to " + connection.host + " timed out.");
		})
		.on("connect", (connection) => {
			console.log("Tunnel established on port " + connection.localPort);
			console.log("pid: " + connection.pid);
		});
}

botHostExpose();
