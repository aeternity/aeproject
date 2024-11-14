import path from "path";

import { exec as execP } from "promisify-child-process";
import fs from "fs";

export const cwd = path.join(process.cwd(), ".testdir");

export async function exec(cmd, options = {}) {
  return execP(
    `${fs.existsSync("~/.profile") ? ". ~/.profile;" : ""}${cmd}`,
    options,
  );
}

export async function prepareLocal() {
  cleanLocal();
  await exec("npm run link:local");
  if (!fs.existsSync(cwd)) fs.mkdirSync(cwd);
}

export function cleanLocal() {
  if (fs.existsSync(cwd)) fs.rmSync(cwd, { recursive: true });
}

export async function linkLocalLib(folder) {
  const c = folder ? path.join(cwd, folder) : cwd;
  await exec("npm i .. -D", { cwd: c });
  await exec(
    'perl -i -pe \'s/"prepare"/"rem-prepare"/g\' ../node_modules/@aeternity/aepp-sdk/package.json',
    { cwd: c },
  );
  await exec("npm i ../node_modules/@aeternity/aepp-sdk", { cwd: c });
}
