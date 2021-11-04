const { ContractCompilerAPI } = require('@aeternity/aepp-sdk');

const { printError, print } = require('../utils');
const utils = require('../utils');
const config = require('../config');

async function compileAndPrint(file, compiler) {
  try {
    const result = await compiler.compileContractAPI(utils.getContractContent(file), { filesystem: utils.getFilesystem(file) });
    print(`Contract '${file}' has been successfully compiled.`);
    print(`=> bytecode: ${result}`);
  } catch (error) {
    const errorMessage = utils.checkNestedProperty(error.response, 'data') ? JSON.parse(error.response.data)[0] : error.message;
    printError(`Contract '${file}' has not been compiled.`);
    printError(`=> reason: ${JSON.stringify(errorMessage)}`);
  }
}

async function run(path, compilerUrl = config.compilerUrl) {
  print('===== Compiling contracts =====');
  print('\r');
  const compiler = await ContractCompilerAPI({ compilerUrl });
  print(`Compiler URL: ${compilerUrl}`);
  print(`Compiler version: ${await compiler.getCompilerVersion()}`);
  print('\r');
  print(`Contract path: ${path}`);

  // TODO check async await correct
  if (path.includes('.aes')) {
    compileAndPrint(path, compiler);
  } else {
    print('\r');
    const files = await utils.getFiles(`${process.cwd()}/${path}/`, '.*\.(aes)');
    files.forEach(async (file) => {
      compileAndPrint(file, compiler);
    });
  }
}

module.exports = {
  run,
};
