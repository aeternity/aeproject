const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('promisify-child-process');
const { Universal, MemoryAccount, Node } = require('@aeternity/aepp-sdk');

const networks = require('./networks.json');
const wallets = require('./wallets.json');

const getContractContent = (contractSource) => fs.readFileSync(contractSource, 'utf8');

const getFilesystem = (contractSource) => {
  const defaultIncludes = [
    'List.aes', 'Option.aes', 'String.aes',
    'Func.aes', 'Pair.aes', 'Triple.aes',
    'BLS12_381.aes', 'Frac.aes',
  ];
  const rgx = /^include\s+"([\d\w\/.\-_]+)"/gmi;
  const rgxIncludePath = /"([\d\w\/.\-_]+)"/gmi;
  const rgxMainPath = /.*\//g;

  const contractContent = getContractContent(contractSource);
  const filesystem = {};

  const rootIncludes = contractContent.match(rgx);
  if (!rootIncludes) return filesystem;

  for (const rootInclude of rootIncludes) {
    const contractPath = rgxMainPath.exec(contractSource);
    const includeRelativePath = rgxIncludePath.exec(rootInclude);

    if (defaultIncludes.includes(includeRelativePath[1])) continue;

    console.log(`==> Adding include to filesystem: ${includeRelativePath[1]}`);
    const includePath = path.resolve(`${contractPath[0]}/${includeRelativePath[1]}`);

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

const getClient = async () => {
  const instance = await Node({ url: networks.devmode.nodeUrl, ignoreVersion: true }).catch((error) => {
    if (error.message && error.message.includes('ECONNREFUSED')) {
      console.log('please start environment first using \'aeproject env\'');
      process.exit(1);
    } else {
      throw error;
    }
  });

  return Universal.compose({
    deepProps: { Ae: { defaults: { interval: 50 } } },
  })({
    nodes: [{ name: 'node', instance }],
    compilerUrl: networks.devmode.compilerUrl,
    accounts: [MemoryAccount({ keypair: wallets[0] })],
  });
};

const awaitKeyBlocks = async (client, n = 1) => {
  const height = await client.height();
  await get(`http://localhost:3001/emit_kb?n=${n}`);
  await client.awaitHeight(height + n);
};

let snapshotHeight = -1;

const createSnapshot = async (client) => {
  snapshotHeight = await client.height();
  await awaitKeyBlocks(client, 1);
};

const rollbackSnapshot = async (client) => {
  const currentBlockHeight = await client.height();
  if (currentBlockHeight > snapshotHeight) {
    // TODO replace with http api call
    const cmd = `docker exec aeproject_node bin/aeternity db_rollback --height ${snapshotHeight}`;
    await exec(cmd);
    await awaitKeyBlocks(client, 1);
  } else {
  }
};

module.exports = {
  getContractContent,
  getFilesystem,
  awaitKeyBlocks,
  createSnapshot,
  rollbackSnapshot,
  getClient,
};
