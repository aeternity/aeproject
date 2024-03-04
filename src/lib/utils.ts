import fs from 'fs';
import path from 'path';

import {
  AeSdk, MemoryAccount, Node, CompilerHttp,
} from '@aeternity/aepp-sdk';
import * as networks from './networks.json';
import wallets from './wallets.json';
import { get } from '../utils/utils';

export const getContractContent = (contractPath) => fs.readFileSync(contractPath, 'utf8');

export const getFilesystem = (contractPath) => {
  const defaultIncludes = [
    'List.aes', 'Option.aes', 'String.aes',
    'Func.aes', 'Pair.aes', 'Triple.aes',
    'BLS12_381.aes', 'Frac.aes', 'Set.aes',
    'Bitwise.aes',
  ];

  const rgx = /^include\s+"([\w/.-]+)"/gim;
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

export const getDefaultAccounts = () => wallets.map((keypair) => new MemoryAccount(keypair.secretKey));

export const getSdk = () => {
  const instance = new Node(networks.devmode.nodeUrl, { ignoreVersion: true });

  return new AeSdk({
    accounts: getDefaultAccounts(),
    nodes: [{ name: 'node', instance }],
    onCompiler: new CompilerHttp(networks.devmode.compilerUrl),
    interval: 50,
  });
};

export const awaitKeyBlocks = async (aeSdk, n = 1) => {
  const height = await aeSdk.getHeight();
  await get(`http://localhost:3001/emit_kb?n=${n}`);
  await aeSdk.awaitHeight(height + n);
};

let snapshotHeight = -1;

export const createSnapshot = async (aeSdk) => {
  snapshotHeight = await aeSdk.getHeight();
  await awaitKeyBlocks(aeSdk, 1);
};

export const rollbackHeight = async (aeSdk, height) => {
  const currentBlockHeight = await aeSdk.getHeight();
  if (currentBlockHeight > height) {
    await get(`http://localhost:3001/rollback?height=${height}`);
  }
};

export const rollbackSnapshot = async (aeSdk) => rollbackHeight(aeSdk, snapshotHeight);
