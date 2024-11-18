import { exec } from "promisify-child-process";
import { print } from "../utils/utils.js";

async function run() {
  const workingDirectory = process.cwd();

  await test(workingDirectory);
}

async function test() {
  print("===== Starting Tests =====");

  const child = exec("npm test");

  child.stdout.on("data", (out) => process.stdout.write(out));
  child.stderr.on("data", (err) => process.stderr.write(err));
  await child;
}

export default { run };
