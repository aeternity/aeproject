const fs = require('fs');
const path = require('path');
const http = require('http');
const { AeSdk, MemoryAccount, Node } = require('@aeternity/aepp-sdk');

const networks = require('./networks.json');
const wallets = require('./wallets.json');

const getContractContent = (contractPath) => fs.readFileSync(contractPath, 'utf8');

const getFilesystem = (contractPath) => {
  const defaultIncludes = [
    'List.aes', 'Option.aes', 'String.aes',
    'Func.aes', 'Pair.aes', 'Triple.aes',
    'BLS12_381.aes', 'Frac.aes',
  ];
  const rgx = /^include\s+"([\d\w/.-_]+)"/gmi;
  const rgxIncludePath = /"([\d\w/.-_]+)"/i;
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

async function get(url) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line consistent-return
    const req = http.request(url, { method: 'GET' }, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new Error(`HTTP status code ${res.statusCode}`));
      }

      const body = [];
      res.on('data', (chunk) => body.push(chunk));
      res.on('end', () => resolve(Buffer.concat(body).toString()));
    });

    req.on('error', (err) => reject(err));

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request time out'));
    });

    req.end();
  });
}

const getDefaultAccounts = () => wallets.map((keypair) => new MemoryAccount({ keypair }));

const getSdk = async () => {
  const instance = new Node(networks.devmode.nodeUrl, { ignoreVersion: true });

  const aeSdk = new AeSdk({
    nodes: [{ name: 'node', instance }],
    compilerUrl: networks.devmode.compilerUrl,
    interval: 50,
  });

  await Promise.all(
    getDefaultAccounts().map((account, index) => aeSdk.addAccount(
      account,
      { select: index === 0 },
    )),
  );
  return aeSdk;
};

const awaitKeyBlocks = async (aeSdk, n = 1) => {
  const height = await aeSdk.height();
  await get(`http://localhost:3001/emit_kb?n=${n}`);
  await aeSdk.awaitHeight(height + n);
};

let snapshotHeight = -1;

const createSnapshot = async (aeSdk) => {
  snapshotHeight = await aeSdk.height();
  await awaitKeyBlocks(aeSdk, 1);
};

const rollbackSnapshot = async (aeSdk) => {
  const currentBlockHeight = await aeSdk.height();
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
