const fs = require('fs');
const path = require('path');
const {
  AeSdk, MemoryAccount, Node, CompilerHttp,
} = require('@aeternity/aepp-sdk');

const networks = require('./networks.json');
const wallets = require('./wallets.json');
const { get } = require('../utils/utils');

const getContractContent = (contractPath) => fs.readFileSync(contractPath, 'utf8');

const getFilesystem = (contractPath) => {
  const defaultIncludes = [
    'List.aes', 'Option.aes', 'String.aes',
    'Func.aes', 'Pair.aes', 'Triple.aes',
    'BLS12_381.aes', 'Frac.aes', 'Set.aes',
    'Bitwise.aes',
  ];
  const rgx = /^include\s+"([\w/.-]+)"/gmi;
  const rgxIncludePath = /"([\w/.-]+)"/i;
  const rgxMainPath = /.*\//g;

  const contractContent = getContractContent(contractPath);
  const filesystem = {};

  const rootIncludes = contractContent.match(rgx);
  if (!rootIncludes) return filesystem;
  const contractPathMatch = rgxMainPath.exec(contractPath);

  // eslint-disable-next-line no-restricted-syntax
  for (const rootInclude of rootIncludes) {
    const includeRelativePath = rgxIncludePath.exec(rootInclude);

    // eslint-disable-next-line no-continue
    if (defaultIncludes.includes(includeRelativePath[1])) continue;

    // eslint-disable-next-line no-console
    console.log(`==> Adding include to filesystem: ${includeRelativePath[1]}`);
    const includePath = path.resolve(`${contractPathMatch[0]}/${includeRelativePath[1]}`);

    try {
      filesystem[includeRelativePath[1]] = fs.readFileSync(includePath, 'utf-8');
    } catch (error) {
      throw Error(`File to include '${includeRelativePath[1]}' not found.`);
    }

    Object.assign(filesystem, getFilesystem(includePath));
  }

  return filesystem;
};

const getDefaultAccounts = () => wallets.map((keypair) => new MemoryAccount(keypair.secretKey));

const getSdk = async () => {
  const instance = new Node(networks.devmode.nodeUrl, { ignoreVersion: true });

  return new AeSdk({
    accounts: getDefaultAccounts(),
    nodes: [{ name: 'node', instance }],
    onCompiler: new CompilerHttp(networks.devmode.compilerUrl),
    interval: 50,
  });
};

const awaitKeyBlocks = async (aeSdk, n = 1) => {
  const height = await aeSdk.getHeight();
  await get(`http://localhost:3001/emit_kb?n=${n}`);
  await aeSdk.awaitHeight(height + n);
};

let snapshotHeight = -1;

const createSnapshot = async (aeSdk) => {
  snapshotHeight = await aeSdk.getHeight();
  await awaitKeyBlocks(aeSdk, 1);
};

const rollbackSnapshot = async (aeSdk) => {
  const currentBlockHeight = await aeSdk.getHeight();
  if (currentBlockHeight > snapshotHeight) {
    await get(`http://localhost:3001/rollback?height=${snapshotHeight}`);
    await awaitKeyBlocks(aeSdk, 1);
  }
};

module.exports = {
  getContractContent,
  getFilesystem,
  awaitKeyBlocks,
  createSnapshot,
  rollbackSnapshot,
  getSdk,
  getDefaultAccounts,
};
