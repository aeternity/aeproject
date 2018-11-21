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
const {
  spawn
} = require('promisify-child-process');
const Universal = AeSDK.Universal;


const config = {
  localhost: "http://localhost:3001",
  edgenetHost: "https://sdk-edgenet.aepps.com",
  keyPair: {
    secretKey: 'bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca',
    publicKey: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU'
  },
  nonce: 1
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
  if (fs.existsSync(`${destinationFileOrDir}`)) {
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

const getClient = async function (url) {
  let client;
  let internalUrl = url;

  if(url.includes("localhost")){
    internalUrl = internalUrl + "/internal"
  }

  await handleApiError(async () => {
    client = await Universal(
      { url: url, 
        process, 
        keypair: config.keyPair, 
        internalUrl: internalUrl, 
        nativeMode: true 
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

const execute = async (command, args, options = {}) => {
  const child = spawn('aeproject', [command, ...args], options)
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
  config
}