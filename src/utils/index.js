const fsUtils = require('./fs-utils');

const { print } = fsUtils;
const { printError } = fsUtils;
const { createMissingFolder } = fsUtils;
const { copyFileOrDir } = fsUtils;
const { getFiles } = fsUtils;
const { readFileRelative } = fsUtils;
const { writeFileRelative } = fsUtils;
const { fileExists } = fsUtils;
const { readFile } = fsUtils;
const { deleteCreatedFiles } = fsUtils;
const { createDirIfNotExists } = fsUtils;
const writeFileSync = fsUtils.writeFile;

const aeprojectUtils = require('./aeproject-utils');

const { getClient } = aeprojectUtils;
const { getNetwork } = aeprojectUtils;
const { getCompiler } = aeprojectUtils;
const { sleep } = aeprojectUtils;
const { execute } = aeprojectUtils;
const { aeprojectExecute } = aeprojectUtils;
const { config } = aeprojectUtils;
const { handleApiError } = aeprojectUtils;
const { logApiError } = aeprojectUtils;
const { timeout } = aeprojectUtils;
const { contractCompile } = aeprojectUtils;
const { checkNestedProperty } = aeprojectUtils;
const { winExec } = aeprojectUtils;
const { readSpawnOutput } = aeprojectUtils;
const { readErrorSpawnOutput } = aeprojectUtils;
const { capitalize } = aeprojectUtils;
const { addCaretToDependencyVersion } = aeprojectUtils;
const { prompt } = aeprojectUtils;

const contract_utils = require('./contract-utils');

const { getFilesystem } = contract_utils;
const { getContractContent } = contract_utils;

const SophiaUtil = require('./sophia-util');
const { httpGet } = require('./http-utils');

module.exports = {
  print,
  printError,
  createMissingFolder,
  copyFileOrDir,
  getFiles,
  getClient,
  getNetwork,
  getCompiler,
  sleep,
  execute,
  readFile,
  deleteCreatedFiles,
  config,
  handleApiError,
  logApiError,
  timeout,
  aeprojectExecute,
  readFileRelative,
  writeFileRelative,
  fileExists,
  SophiaUtil,
  contractCompile,
  checkNestedProperty,
  createDirIfNotExists,
  writeFileSync,
  winExec,
  httpGet,
  readSpawnOutput,
  readErrorSpawnOutput,
  capitalize,
  addCaretToDependencyVersion,
  prompt,
  getFilesystem,
  getContractContent,
};
