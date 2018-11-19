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
require = require('esm')(module /*, options */ ) // use to handle es6 import/export

const {
  printError,
  print
} = require('./../utils');
const utils = require('../utils');
const {
  spawn
} = require('promisify-child-process');
const dockerCLI = require('docker-cli-js');
const docker = new dockerCLI.Docker();
const epochConfig = require('./config.json')
const config = epochConfig.config;
const defaultWallets = epochConfig.defaultWallets;

async function dockerPs() {
  let running = false

  await docker.command('ps', function (err, data) {
    if (err) {
      throw new Error(err);
    }

    data.containerList.forEach(function (container) {
      if (container.image.startsWith("aeternity") && container.status.indexOf("healthy") != -1) {
        running = true;
      }
    })
  });
  return running;
}

async function fundWallets() {

  waitToFundWallet()
  let walletIndex = 1;

  let client = await utils.getClient();
  for (let wallet in defaultWallets) {
    console.log(wallet)
    await fundWallet(client, defaultWallets[wallet].publicKey)
    print(`#${walletIndex++} ------------------------------------------------------------`)
    print(`public key: ${defaultWallets[wallet].publicKey}`)
    print(`private key: ${defaultWallets[wallet].secretKey}`)
  }
}

async function waitToFundWallet() {
  let client = await utils.getClient();
  let balance = 0;
  while (parseInt(balance) > 0) {
    try {
      process.stdout.write(".");
      utils.sleep(2500)
      balance = (await client.balance(await client.address()));
    } catch (e) {
      throw new Error(`Funding wallet ${client} failed`)
    }
  }
}

async function fundWallet(client, recipient) {
  const {
    tx
  } = await client.api.postSpend({
    fee: 1,
    amount: 100000000000000000,
    senderId: config.keyPair.publicKey,
    recipientId: recipient,
    payload: '',
    ttl: 123,
    nonce: config.nonce++
  })

  const signed = await client.signTransaction(tx)
  await client.api.postTransaction({
    tx: signed
  })
}

async function run(option) {
  try {
    let dockerProcess;
    let running = await dockerPs();

    if (option.stop) {
      if (running) {
        print('===== Stopping epoch =====');

        dockerProcess = await spawn('docker-compose', ['down', '-v'], {});

        print('===== Epoch was successfully stopped! =====');
        return;
      }
      print('===== Epoch is not running! =====');
      return
    }
    if (!running) {
      print('===== Starting epoch =====');
      dockerProcess = spawn('docker-compose', ['up', '-d']);

      dockerProcess.stderr.on('data', (data) => {
        print(data.toString())
      })

      while (!(await dockerPs())) {
        process.stdout.write(".");
        utils.sleep(1000);
      }

      print('\n\r===== Epoch was successfully started! =====');
      print('===== Funding default wallets! =====');

      await fundWallets();

      print('\r\n===== Default wallets was successfully funded! =====');
      return
    }
    print('\r\n===== Epoch already started and healthy started! =====');

  } catch (e) {
    printError(e.message)
  }
}

module.exports = {
  run
}