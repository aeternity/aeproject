import { spawn } from "child_process";
import { print } from "../utils/utils.js";

async function run() {
  const workingDirectory = process.cwd();

  await test(workingDirectory);
}

async function test() {
  print("===== Starting Tests =====");

  const proc = spawn("npm", ["test"], { stdio: "inherit" });

  await new Promise((resolve) => proc.on("close", resolve));
}

export default { run };
