const dockerCLI = require('docker-cli-js');
const docker = new dockerCLI.Docker();

async function dockerPs() {
	let running = false

	await docker.command('ps', function (err, data) {
		data.containerList.forEach(function (container) {
			if (container.image.startsWith("aeternity") && container.status.indexOf("healthy") != -1) {
				running = true;
			}
		})
	});

	return running;
}

module.exports = {
	dockerPs
}