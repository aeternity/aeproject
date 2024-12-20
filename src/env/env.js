import { print, printError, exec } from "../utils/utils.js";

async function getDockerCompose() {
  if (getDockerCompose._cmd) return getDockerCompose._cmd;

  for (const cmd of ["docker compose", "docker-compose"]) {
    if (await exec(cmd).catch(() => false)) {
      getDockerCompose._cmd = cmd;
      return cmd;
    }
  }

  throw new Error("===== docker compose is not installed! =====");
}

export async function isEnvRunning(cwd = "./") {
  const info = await getInfo(cwd);

  if (info) {
    const containers = [
      "aeproject_node",
      "aeproject_compiler",
      "aeproject_proxy",
    ];
    return containers.some((containerName) => {
      const line = info.split("\n").find((l) => l.includes(containerName));
      return line && (line.includes("Up") || line.includes("running"));
    });
  }

  return false;
}

async function run(option) {
  const running = await isEnvRunning();

  if (option.info) {
    await printInfo(running);
    return;
  }

  if (option.stop) {
    await stopEnv(running);
    return;
  }
  if (option.restart) {
    await restartEnv(running);
    return;
  }

  await startEnv(option);
}

async function stopEnv(running) {
  if (!running) {
    printError("===== Env is not running! =====");
    return;
  }

  print("===== stopping env =====");

  const cmd = await getDockerCompose();
  await exec(`${cmd} down -v`);

  print("===== Env was successfully stopped! =====");
}

async function restartEnv(running) {
  if (!running) {
    printError("===== Env is not running! =====");
    return;
  }

  print("===== restarting env =====");

  const cmd = await getDockerCompose();
  await exec(`${cmd} restart`);

  print("===== env was successfully restarted! =====");
}

async function startEnv(option) {
  if (await isEnvRunning()) {
    print("===== env already running, updating env =====");
  } else {
    print("===== starting env =====");
  }

  const versionTags = `${option.nodeVersion ? `NODE_TAG=${option.nodeVersion}` : ""} ${option.compilerVersion ? `COMPILER_TAG=${option.compilerVersion}` : ""}`;
  if (versionTags.trim() !== "")
    print(`using versions as specified: ${versionTags}`);
  else print("using versions from docker-compose.yml");

  const cmd = await getDockerCompose();
  await exec(`${versionTags} ${cmd} pull`);
  await exec(`${versionTags} ${cmd} up -d --wait`);

  const isRunning = await isEnvRunning();
  await printInfo(isRunning, true);
  if (isRunning) print("===== env was successfully started =====");
}

async function printInfo(running, imagesOnly = false) {
  if (!running) {
    printError(
      "===== compiler or node is not running ===== \n===== run 'aeproject env' to start the development setup =====",
    );
    return;
  }

  print(await getInfo(undefined, imagesOnly));
}

async function getInfo(cwd = "./", imagesOnly = false) {
  const cmd = await getDockerCompose();
  const ps = await exec(`${cmd} ps`, { cwd });
  const images = await exec(`${cmd} images`, { cwd });

  if (ps && images && ps.stdout && images.stdout) {
    return imagesOnly ? images.stdout : `${ps.stdout}\n${images.stdout}`;
  }

  return null;
}

export default { run };
