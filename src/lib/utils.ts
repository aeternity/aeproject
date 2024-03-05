import fs from 'fs';
import path from 'path';

import {
  AeSdk, MemoryAccount, Node, CompilerHttp,
} from '@aeternity/aepp-sdk';
import * as networks from './networks.json';
import wallets from './wallets.json';
import { get } from '../utils/utils';

export function getContractContent(contractPath: string): string {
  return fs.readFileSync(contractPath, 'utf8');
}

export function getFilesystem(contractPath: string): { [key: string]: string } {
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
}

export function getDefaultAccounts(): MemoryAccount[] {
  return wallets.map((keypair) => new MemoryAccount(keypair.secretKey));
}

export function getSdk(): AeSdk {
  const instance = new Node(networks.devmode.nodeUrl, { ignoreVersion: true });

  return new AeSdk({
    accounts: getDefaultAccounts(),
    nodes: [{ name: 'node', instance }],
    onCompiler: new CompilerHttp(networks.devmode.compilerUrl),
    interval: 50,
  });
}

export async function awaitKeyBlocks(aeSdk: AeSdk, n: number = 1): Promise<void> {
  const height = await aeSdk.getHeight();
  await get(`http://localhost:3001/emit_kb?n=${n}`);
  await aeSdk.awaitHeight(height + n);
}

let snapshotHeight = -1;

export async function createSnapshot(aeSdk: AeSdk): Promise<void> {
  snapshotHeight = await aeSdk.getHeight();
  await awaitKeyBlocks(aeSdk, 1);
}

export async function rollbackHeight(aeSdk: AeSdk, height: number): Promise<void> {
  const currentBlockHeight = await aeSdk.getHeight();
  if (currentBlockHeight > height) {
    await get(`http://localhost:3001/rollback?height=${height}`);
  }
}

export async function rollbackSnapshot(aeSdk: AeSdk): Promise<void> {
  if (snapshotHeight === -1) throw new Error('no snapshot created');
  return rollbackHeight(aeSdk, snapshotHeight);
}
