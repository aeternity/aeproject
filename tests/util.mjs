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

let isPacked = false;

export async function linkLocalLib(folder) {
  const c = folder ? path.join(cwd, folder) : cwd;
  if (!isPacked) {
    await exec("npm pack --ignore-scripts");
    isPacked = true;
  }
  await exec(`npm i ${path.join(process.cwd(), "aeternity-aeproject-*.tgz")} -D`, { cwd: c });
}
