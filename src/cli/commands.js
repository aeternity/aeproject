const init = require("../init/init");
const testConfig = require("../test/test");
const env = require("../env/env");
const constants = require("../init/constants.json");

const addInitOption = (program) => {
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
};

const addTestOption = (program) => {
  program
    .command("test")
    .description("Running the tests")
    .action(async (options) => {
      await testConfig.run(options.path);
    });
};

const addEnvOption = (program) => {
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
};

const initCommands = (program) => {
  addInitOption(program);
  addTestOption(program);
  addEnvOption(program);
};

module.exports = {
  initCommands,
};
