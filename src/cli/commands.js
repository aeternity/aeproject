const init = require('../init/init');
const testConfig = require('../test/test');
const env = require('../env/env');
const config = require('../config/node-config.json');
const constants = require('../init/constants.json');

const nodeConfig = config.nodeConfiguration;
const compilerConfig = config.compilerConfiguration;

const addInitOption = (program) => {
  program
    .command('init')
    .description('Initialize AEproject')
    .argument('[folder]', 'project name for folder to be created', constants.artifactsDest)
    .option('--update', 'update project files')
    .action(async (folder, option) => {
      await init.run(folder, option.update);
    });
};

const addTestOption = (program) => {
  program
    .command('test')
    .description('Running the tests')
    .action(async (options) => {
      await testConfig.run(options.path);
    });
};

const addEnvOption = (program) => {
  program
    .command('env')
    .description('Running a local network. Without any argument started with default configuration')
    .option('--stop', 'Stop the node')
    .option('--info', 'Displays information about your current node status if any, and absolute path where it has been started from')
    .option('--nodeVersion [nodeVersion]', `Specify node version, default is ${nodeConfig.imageVersion}`, nodeConfig.imageVersion)
    .option('--compilerVersion [compilerVersion]', `Specify compiler version, default is ${compilerConfig.imageVersion}`, compilerConfig.imageVersion)
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
