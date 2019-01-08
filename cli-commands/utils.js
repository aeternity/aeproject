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

const fs = require('fs-extra');
const dir = require('node-dir');
const AeSDK = require('@aeternity/aepp-sdk');
const Crypto = AeSDK.Crypto;
const {
  spawn
} = require('promisify-child-process');
const Universal = AeSDK.Universal;

const config = {
  localhost: "http://localhost:3001",
  edgenetHost: "https://sdk-edgenet.aepps.com",
  testnetHost: "https://sdk-testnet.aepps.com",
  mainnetHost: "https://sdk-mainnet.aepps.com",
  keypair: {
    secretKey: 'bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca',
    publicKey: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU'
  }
}

// Print helper
const print = (msg, obj) => {
  if (obj) {
    console.log(msg, obj)
  } else {
    console.log(msg)
  }
}

// Print error helper
const printError = (msg) => {
  console.log(msg)
}

const createIfExistsFolder = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

const copyFileOrDir = (sourceFileOrDir, destinationFileOrDir, copyOptions = {}) => {
  if (fs.existsSync(`${destinationFileOrDir}`) && copyOptions.overwrite == false) {
    throw new Error(`${destinationFileOrDir} already exists.`);
  }

  fs.copySync(sourceFileOrDir, destinationFileOrDir, copyOptions)
}

const getFiles = async function (directory, regex) {
  return new Promise((resolve, reject) => {
    dir.files(directory, (error, files) => {
      if (error) {
        reject(new Error(error));
        return;
      }
      
      files = files.filter(function (file) {
        return file.match(regex) != null;
      });

      resolve(files);
    });
  });
}

const getClient = async function (url, keypair = config.keypair) {
  let client;
  let internalUrl = url;
  let networkId = 'ae_devnet'


  if (url.includes("localhost")) {
    internalUrl = internalUrl + "/internal"
  }

  if (url.includes(config.mainnetHost)) {
    networkId = 'ae_mainnet'
  }


  await handleApiError(async () => {
    client = await Universal({
      url,
      process,
      keypair,
      internalUrl,
      nativeMode: true,
      networkId: networkId
    })
  })

  return client;
}

const handleApiError = async (fn) => {
  try {

    return await fn()
  } catch (e) {
    const response = e.response
    logApiError(response && response.data ? response.data.reason : e)
    process.exit(1)
  }
}

function logApiError(error) {
  printError(`API ERROR: ${error}`)
}

const sleep = (ms) => {
  var start = Date.now();
  while (true) {
    var clock = (Date.now() - start);
    if (clock >= ms) break;
  }
}

const forgaeExecute = async (command, args, options = {}) => {
  return await execute("forgae", command, args, options)
}

const execute = async (cli, command, args, options = {}) => {
  const child = spawn(cli, [command, ...args], options)
  let result = '';

  child.stdout.on('data', (data) => {
    result += data.toString();
  })

  child.stderr.on('data', (data) => {
    result += data.toString();
  })

  await child;
  return result;
}

const readFile = async (path, encoding = null, errTitle = 'READ FILE ERR') => {
  try {
    return fs.readFileSync(
      path,
      encoding
    )
  } catch (e) {
    switch (e.code) {
      case 'ENOENT':
        throw new Error('File not found')
        break
      default:
        throw e
    }
  }
}

function keyToHex (publicKey) {
	let byteArray = Crypto.decodeBase58Check(publicKey.split('_')[1]);
	let asHex = '0x' + byteArray.toString('hex');
  return asHex;
}

const isKeyPair = (k) => {
  if (k == null) {
    return false
  }
  if (typeof k != 'object') {
    return false
  }

  if (!k.hasOwnProperty('publicKey')) {
    return false
  }

  if (!k.hasOwnProperty('secretKey')) {
    return false
  }

  return true
}

const generatePublicKeyFromSecretKey = (secretKey) => {
  const hexStr = Crypto.hexStringToByte(secretKey.trim())
  const keys = Crypto.generateKeyPairFromSecret(hexStr)

  return Crypto.aeEncodeKey(keys.publicKey)
}

module.exports = {
  print,
  printError,
  createIfExistsFolder,
  copyFileOrDir,
  getFiles,
  getClient,
  sleep,
  execute,
  readFile,
  config,
  keyToHex,
  forgaeExecute,
  isKeyPair,
  generatePublicKeyFromSecretKey
}