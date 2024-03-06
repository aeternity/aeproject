const http = require("http");
const config = require("../config/config.json");

// eslint-disable-next-line no-promise-executor-return
const pause = async (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));

const ensureNodeAndCompilerAvailable = async (
  interval = 100,
  attempts = 1200,
) => {
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < attempts; i++) {
    // eslint-disable-next-line no-await-in-loop
    if (i !== 0) await pause(interval);
    // eslint-disable-next-line no-await-in-loop
    const nodeAvailable = await get("http://localhost:3001/v3/status")
      .then(() => true)
      .catch(() => false);
    // eslint-disable-next-line no-await-in-loop
    const compilerAvailable = await get("http://localhost:3080/version")
      .then(() => true)
      .catch(() => false);
    if (nodeAvailable && compilerAvailable) return;
    // eslint-disable-next-line no-console
    if (i !== 0 && i % 50 === 0)
      console.log(
        "waiting for node and compiler to come up, node:",
        nodeAvailable,
        "compiler:",
        compilerAvailable,
      );
  }

  throw new Error("timed out waiting for node to come up");
};

const get = async (url) =>
  new Promise((resolve, reject) => {
    // eslint-disable-next-line consistent-return
    const req = http.request(url, { method: "GET" }, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new Error(`HTTP status code ${res.statusCode}`));
      }

      const body = [];
      res.on("data", (chunk) => body.push(chunk));
      res.on("end", () => resolve(Buffer.concat(body).toString()));
    });

    req.on("error", (err) => reject(err));

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request time out"));
    });

    req.end();
  });

const getNetwork = (network) => {
  const networks = {
    local: {
      url: config.localhostParams.url,
      networkId: config.localhostParams.networkId,
    },
    testnet: {
      url: config.testNetParams.url,
      networkId: config.testNetParams.networkId,
    },
    mainnet: {
      url: config.mainNetParams.url,
      networkId: config.mainNetParams.networkId,
    },
  };

  return networks[network];
};

module.exports = {
  // eslint-disable-next-line no-console
  print: console.log,
  // eslint-disable-next-line no-console
  printError: console.error,
  config,
  getNetwork,
  ensureNodeAndCompilerAvailable,
  get,
};
