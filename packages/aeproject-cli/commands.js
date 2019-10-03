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
const compile = require('./aeproject-compile/compile.js');
const init = require('./aeproject-init/init.js');
const testConfig = require('./aeproject-test/test.js');
const node = require('./aeproject-node/node.js');
const deploy = require('./aeproject-deploy/deploy.js');
const config = require('aeproject-config');
const localCompiler = config.localCompiler;
const dockerIp = config.nodeConfiguration.dockerMachineIP;
const history = require('aeproject-logger');
const printReportTable = require('aeproject-utils').printReportTable;
const contracts = require('./aeproject-contracts/aeproject-contracts.js');
const shape = require('./aeproject-shapes/shape-commander');
const exportConfig = require('./aeproject-export/export-config');
const aeprojectConfigDefaultFileName = require('./aeproject-export/constants').aeprojectConfigFileName;

const addInitOption = (program) => {
    program
        .command('init')
        .description('Initialize AEproject')
        .option('--update [update]', 'Update project files')
        .action(async (option) => {
            await init.run(option.update);
        })
}

const addCompileOption = (program) => {
    program
        .command('compile')
        .option('--path [compile path]', 'Path to contract files', './contracts')
        .option('--compiler [compiler url]', 'Url to the desired compiler', config.compilerUrl + "/compile")
        .description('Compile contracts')
        .action(async (option) => {
            await compile.run(option.path, option.compiler);
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
        .option('--only', 'Start only the node without local compiler')
        .option('--windows', 'Start the node in windows env')
        .option('--docker-ip [default docker machine ip]', `Set docker machine IP, default is "${ dockerIp }"`, dockerIp)
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
        .option('--networkId [networkId]', 'Configure your network id')
        .option('-s --secretKey [secretKey]', 'Wallet secretKey(privateKey)')
        .option('--compiler [compiler_url]', 'Url to the desired compiler')
        .action(async (options) => {
            await deploy.run(options.path, options.network, options.secretKey, options.compiler, options.networkId);
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
        .description('Running a Contract web aepp locally and connect it to the spawned aeproject node.')
        .option('--nodeUrl [nodeUrl]', 'Specify the url of the local spawned node', 'http://localhost:3001/')
        .option('--update [update]', 'Update the contracts aepp with the latest version of develop branch')
        .option('--ignoreOpenInBrowser [ignoreOpenInBrowser]', 'Ignore browser opening')
        .action(async (options) => {
            await contracts.run(options);
        })
};

const addShapeOption = (program) => {
    program
        .command('shape')
        .description('Initialize a web Vue project.')
        .arguments('<type> [type]', 'Type can be Vue|vue.')
        .action(async (options) => {
            await shape.run(options);
        })
};

const addExportConfigOption = (program) => {
    program
        .command('export-config')
        .description('Export miner account, few funded accounts  and default node configuration.')
        .option('--path [export path]', 'Path to export config file', aeprojectConfigDefaultFileName)
        .action(async (options) => {
            await exportConfig.run(options);
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
    addShapeOption(program);
    addExportConfigOption(program);
}

module.exports = {
    initCommands
}