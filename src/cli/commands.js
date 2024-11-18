import init from "../init/init.js";
import testConfig from "../test/test.js";
import env from "../env/env.js";
import { readFile } from "fs/promises";

const constants = JSON.parse(
  await readFile(new URL("../init/constants.json", import.meta.url)),
);

function addInitOption(program) {
  program
    .command("init")
    .description("Initialize AEproject")
    .argument(
      "[folder]",
      "project name for folder to be created",
      constants.artifactsDest,
    )
    .option("--update", "update project files")
    .option(
      "--next",
      "apply patches to initialise or update for use with the upcoming release",
    )
    .option("-y", "overwrite all files in update process")
    .action(async (folder, option) => {
      await init.run(folder, option.update, option.next, option.y);
    });
}

function addTestOption(program) {
  program
    .command("test")
    .description("Running the tests")
    .action(async (options) => {
      await testConfig.run(options.path);
    });
}

function addEnvOption(program) {
  program
    .command("env")
    .description(
      "Running a local network. Without any argument started with default configuration",
    )
    .option("--stop", "Stop the development environment")
    .option("--restart", "Restart the development environment")
    .option(
      "--info",
      "Displays information about your current development environment status",
    )
    .option(
      "--nodeVersion [nodeVersion]",
      "Specify node version, default is whatever is locally configured in docker-compose.yml",
    )
    .option(
      "--compilerVersion [compilerVersion]",
      "Specify compiler version, default is whatever is locally configured in docker-compose.yml",
    )
    .action(async (options) => {
      await env.run(options);
    });
}

export function initCommands(program) {
  addInitOption(program);
  addTestOption(program);
  addEnvOption(program);
}
