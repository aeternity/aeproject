let filesAndfoldersToRemove = [
	'node_modules',
	'deploy',
	'docker',
	'test',
	'contracts/ExampleContract.aes',
	'package.json',
	'package-lock.json',
	'docker-compose.yml'
]
const fs = require('fs-extra')

const dockerCLI = require('docker-cli-js');
const docker = new dockerCLI.Docker();

async function cleanUp() {
	let path = process.cwd() + "/bin/aeproject/test/";
	filesAndfoldersToRemove.forEach((e) => {
		try {
			fs.removeSync(path + e);
		} catch (e) {

		}
	})
}

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
	cleanUp,
	dockerPs
}