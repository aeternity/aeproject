const http = require("http");
const config = require("../config/config.json");

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
  get,
};
