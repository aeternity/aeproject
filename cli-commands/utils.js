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
// const toBytes = require('@aeternity/aepp-sdk/es/utils/bytes').toBytes;

const config = {
  localhostParams: {
    url: "http://localhost:3001",
    networkId: 'ae_devnet'
  },
  testnetParams: {
    url: "https://sdk-testnet.aepps.com",
    networkId: 'ae_uat'
  },
  mainnetParams: {
    url: 'https://sdk-mainnet.aepps.com',
    networkId: 'ae_mainnet'
  },
  keypair: {
    secretKey: 'bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca',
    publicKey: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU'
  }
};

// Print helper
const print = (msg, obj) => {
  if (obj) {
    console.log(msg, obj)
  } else {
    console.log(msg)
  }
};

// Print error helper
const printError = (msg) => {
  console.log(msg)
};

const createMissingFolder = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

const copyFileOrDir = (sourceFileOrDir, destinationFileOrDir, copyOptions = {}) => {
  if (fs.existsSync(`${destinationFileOrDir}`) && !copyOptions.overwrite) {
    throw new Error(`${destinationFileOrDir} already exists.`);
  }

  fs.copySync(sourceFileOrDir, destinationFileOrDir, copyOptions)
};

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
};

const getClient = async function (network, keypair = config.keypair) {
    let client;
    let internalUrl = network.url;

    if (network.url.includes("localhost")) {
        internalUrl = internalUrl + "/internal"
    }

    await handleApiError(async () => {
        client = await Universal({
            url: network.url,
            process,
            internalUrl,
            keypair,
            nativeMode: true,
            networkId: network.networkId
        })
    });

    return client;
}

const getNetwork = (network) => {
  const networks = {
    local: {
      url: config.localhostParams.url,
      networkId: config.localhostParams.networkId
    },
    testnet: {
      url: config.testnetParams.url,
      networkId: config.testnetParams.networkId
    },
    mainnet: {
      url: config.mainnetParams.url,
      networkId: config.mainnetParams.networkId
    },
  };

    const result = networks[network]
    if (!result) {
        throw new Error(`Unrecognised network ${network}`)
    }

  return result
};

const handleApiError = async (fn) => {
    try {

    return await fn()
  } catch (e) {
    const response = e.response
    logApiError(response && response.data ? response.data.reason : e)
    process.exit(1)
  }
};

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
  });

  child.stderr.on('data', (data) => {
    result += data.toString();
  });

  await child;
  return result;
};

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
};

function keyToHex(publicKey) {
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
};

const generatePublicKeyFromSecretKey = (secretKey) => {
    const hexStr = Crypto.hexStringToByte(secretKey.trim())
    const keys = Crypto.generateKeyPairFromSecret(hexStr)

    return Crypto.aeEncodeKey(keys.publicKey)
}

const timeout = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

async function generateKeyPairFromSecretKey(secretKey) {
    const hexStr = await Crypto.hexStringToByte(secretKey.trim());
    const keys = await Crypto.generateKeyPairFromSecret(hexStr);

    const publicKey = await Crypto.aeEncodeKey(keys.publicKey);

    let keyPair = {
        publicKey,
        secretKey
    }

    return keyPair;
}

module.exports = {
  print,
  printError,
  createMissingFolder,
  copyFileOrDir,
  getFiles,
  getClient,
  getNetwork,
  sleep,
  execute,
  readFile,
  config,
  keyToHex,
  forgaeExecute,
  isKeyPair,
  generatePublicKeyFromSecretKey,
  timeout,
  generateKeyPairFromSecretKey
};
