/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */
const compile = require('./forgae-compile/compile.js');
const init = require('./forgae-init/init.js');
const testConfig = require('./forgae-test/test.js');
const node = require('./forgae-node/node.js');
const deploy = require('./forgae-deploy/deploy.js');
const config = require('./utils').config;
const history = require('./forgae-history/log-store-service');
const printReportTable = require('./forgae-history/utils').printReportTable;
const contracts = require('./forgae-contracts/forgae-contracts.js');

const addInitOption = (program) => {
  program
    .command('init')
    .description('Initialize ForgAE')
    .option('--update [update]', 'Update project files')
    .action(async (option) => {
      await init.run(option.update);
    })
}

const addCompileOption = (program) => {
  program
    .command('compile')
    .option('-n --network [network]', 'Network to connect to', "local")
    .option('--path [compile path]', 'Path to contract files', './contracts')
    .description('Compile contracts')
    .action(async (option) => {
      await compile.run(option.path, option.network);
    })
}

const addTestOption = (program) => {
  program
    .command('test')
    .description('Running the tests')
    .option('--path [tests path]', 'Path to test files', './test')
    .action(async (options) => {
      await testConfig.run(options.path);
    })
}

const addNodeOption = (program) => {
  program
    .command('node')
    .description('Running a local node. Without any argument node will be runned with --start argument')
    .option('--stop', 'Stop the node')
    .option('--start', 'Start the node')
    .action(async (options) => {
      await node.run(options);
    })
}

const addDeployOption = (program) => {
  program
    .command('deploy')
    .description('Run deploy script')
    .option('--path [deploy path]', 'Path to deployment file', './deployment/deploy.js')
    .option('-n --network [network]', 'Select network', "local")
    .option('-s --secretKey [secretKey]', 'Wallet secretKey(privateKey)')
    .action(async (options) => {
      await deploy.run(options.path, options.network, options.secretKey);
    })
}

const addHistoryOption = (program) => {
  program
    .command('history')
    .description('Show deployment history info')
    .option('--limit [limit]', 'Get last N records.', 5)
    .action(async (options) => {

      let data = history.getHistory().slice(options.limit * -1);

      for (let i = 0; i < data.length; i++) {
        printReportTable(data[i].actions);
      }
    })
}

const addContractsAeppIntegrationOption = (program) => {
  program
    .command('contracts')
    .description('Running a Contract web aepp locally and connect it to the spawned forgae node.')
    .option('--nodeUrl [nodeUrl]', 'Specify the url of the local spawned node', 'http://localhost:3001/')
    .option('--update [update]', 'Update the contracts aepp with the latest version of develop branch')
    .option('--ignoreOpenInBrowser [ignoreOpenInBrowser]', 'Ignore browser opening')
    .action(async (options) => {
      await contracts.run(options);
    })
};

const initCommands = (program) => {
  addInitOption(program);
  addCompileOption(program);
  addTestOption(program);
  addNodeOption(program);
  addDeployOption(program);
  addHistoryOption(program);
  addContractsAeppIntegrationOption(program)
}

module.exports = {
  initCommands
}