const path = require("path");

const { exec: execP } = require("promisify-child-process");
const fs = require("fs");

const cwd = path.join(process.cwd(), ".testdir");

async function exec(cmd, options) {
  return execP(
    `${fs.existsSync("~/.profile") ? ". ~/.profile;" : ""}${cmd}`,
    options,
  );
}

async function prepareLocal() {
  cleanLocal();
  await exec("npm run link:local");
  if (!fs.existsSync(cwd)) fs.mkdirSync(cwd);
}

function cleanLocal() {
  if (fs.existsSync(cwd)) fs.rmSync(cwd, { recursive: true });
}

async function linkLocalLib(folder) {
  await exec("npm link @aeternity/aeproject", {
    cwd: folder ? path.join(cwd, folder) : cwd,
  });
}

module.exports = {
  exec,
  cwd,
  prepareLocal,
  cleanLocal,
  linkLocalLib,
};
