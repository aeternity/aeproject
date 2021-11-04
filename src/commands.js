const compile = require('./compile/compile');
const init = require('./init/init');
const testConfig = require('./test/test');
const env = require('./env/env/env');
const node = require('./env/env/node/node');
const compiler = require('./env/env/compiler/compiler');
const deploy = require('./deploy/deploy');
const config = require('./config');

const dockerIp = config.nodeConfiguration.dockerMachineIP;
const exportConfig = require('./export/export-config');
const aeprojectConfigDefaultFileName = require('./export/constants').aeprojectConfigFileName;
const txInspector = require('./tx-inspector/tx-inspector');
const compatibility = require('./compatibility/compatibility');

const nodeConfig = config.nodeConfiguration;
const compilerConfig = config.compilerConfiguration;

const addInitOption = (program) => {
  program
    .command('init')
    .description('Initialize AEproject')
    .option('--update [update]', 'Update project files')
    .action(async (option) => {
      await init.run(option.update);
    });
};

const addCompileOption = (program) => {
  program
    .command('compile')
    .option('-p --path [compile path]', 'Path to contract files', './contracts')
    .option('-c --compiler [compiler url]', 'Url to the desired compiler', config.compilerUrl)
    .description('Compile contracts')
    .action(async (option) => {
      await compile.run(option.path, option.compiler);
    });
};

const addTestOption = (program) => {
  program
    .command('test')
    .description('Running the tests')
    .option('-p --path [tests path]', 'Path to test files', './test')
    .action(async (options) => {
      await testConfig.run(options.path);
    });
};

const addEnvOption = (program) => {
  program
    .command('env')
    .description('Running a local network. Without any argument node will be run with --start argument')
    .option('--stop', 'Stop the node')
    .option('--start', 'Start the node')
    .option('--info', 'Displays information about your current node status if any, and absolute path where it has been started from')
    .option('--windows', 'Start the node in windows env')
    .option('--docker-ip [default docker machine ip]', `Set docker machine IP, default is "${dockerIp}"`, dockerIp)
    .option('--nodeVersion [nodeVersion]', `Specify node version, default is ${nodeConfig.imageVersion}`, nodeConfig.imageVersion)
    .option('--compilerVersion [compilerVersion]', `Specify compiler version, default is ${compilerConfig.imageVersion}`, compilerConfig.imageVersion)
    .action(async (options) => {
      await env.run(options);
    });
};

const addNodeOption = (program) => {
  program
    .command('node')
    .description('Running a local node. Without any argument node will be run with --start argument')
    .option('--stop', 'Stop the node')
    .option('--start', 'Start the node')
    .option('--info', 'Displays information about your current node status if any, and absolute path where it has been started from')
    .option('--windows', 'Start the node in windows env')
    .option('--docker-ip [default docker machine ip]', `Set docker machine IP, default is "${dockerIp}"`, dockerIp)
    .option('--v [v]', `Specify node version, default is ${nodeConfig.imageVersion}`, nodeConfig.imageVersion)
    .action(async (options) => {
      await node.run(options);
    });
};

const addCompilerOption = (program) => {
  program
    .command('compiler')
    .description('Running a local compiler. Without any arguments compiler will be run with --start argument')
    .option('--stop', 'Stop the node')
    .option('--start', 'Start the node')
    .option('--info', 'Displays information about your current node status if any, and absolute path where it has been started from')
    .option('--v [v]', `Specify compiler version, default is ${compilerConfig.imageVersion}`, compilerConfig.imageVersion)
    .action(async (options) => {
      await compiler.run(options);
    });
};

const addDeployOption = (program) => {
  program
    .command('deploy')
    .description('Run deploy script')
    .option('--path [deploy path]', 'Path to deployment file', './deployment/deploy.js')
    .option('-s --secretKey [secretKey]', 'SecretKey (privateKey) to use for deployment')
    .option('-n --network [network]', 'Select a network defined in config/network.json', 'local')
    .option('-c --compiler [compiler_url]', 'URL of the http compiler to use')
    .action(async (options) => {
      await deploy.run(options.path, options.secretKey, options.network, options.compiler);
    });
};

const addExportConfigOption = (program) => {
  program
    .command('export-config')
    .description('Export miner account, few funded accounts  and default node configuration.')
    .option('--path [export path]', 'Path to export config file', aeprojectConfigDefaultFileName)
    .action(async (options) => {
      await exportConfig.run(options);
    });
};

const addTxInspector = (program) => {
  program
    .command('inspect <tx>')
    .description('Unpack and verify transaction (verify nonce, ttl, fee, account balance)')
    .option('--network [network]', 'Select network', 'local')
    .option('--networkId [networkId]', 'Configure your network id')
    .action(async (tx, options) => {
      options.tx = tx;
      await txInspector.run(options);
    });
};

const addCompatibility = (program) => {
  program
    .command('compatibility')
    .description('Start env with latest versions and test the current project for compatibility')
    .option('--nodeVersion [nodeVersion]', 'Specify node version')
    .option('--compilerVersion [compilerVersion]', 'Specify compiler version')
    .option('--windows', 'Start the node in windows env')
    .option('--docker-ip [default docker machine ip]', `Set docker machine IP, default is "${dockerIp}"`, dockerIp)
    .action(async (options) => {
      await compatibility.run(options);
    });
};

const initCommands = (program) => {
  addInitOption(program);
  addCompileOption(program);
  addTestOption(program);
  addEnvOption(program);
  addNodeOption(program);
  addCompilerOption(program);
  addDeployOption(program);
  addExportConfigOption(program);
  addTxInspector(program);
  addCompatibility(program);
};

module.exports = {
  initCommands,
};
