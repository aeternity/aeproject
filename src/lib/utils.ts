import fs from 'fs';

import {
  AeSdk, MemoryAccount, Node, CompilerHttp, getFileSystem,
} from '@aeternity/aepp-sdk';
import * as networks from './networks.json';
import wallets from './wallets.json';
import { get } from '../utils/utils';

export const getContractContent = (contractPath) => fs.readFileSync(contractPath, 'utf8');

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
};

export const rollbackHeight = async (aeSdk, height) => {
  const currentBlockHeight = await aeSdk.getHeight();
  if (currentBlockHeight > height) {
    await get(`http://localhost:3001/rollback?height=${height}`);
    await awaitKeyBlocks(aeSdk, 1);
  }
};

export const rollbackSnapshot = async (aeSdk) => rollbackHeight(aeSdk, snapshotHeight);
