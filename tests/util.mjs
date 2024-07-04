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
  await exec("npm link @aeternity/aeproject", {
    cwd: folder ? path.join(cwd, folder) : cwd,
  });
}
