import http from "http";
import { readFile } from "fs/promises";

const config = JSON.parse(
  await readFile(new URL("../config/config.json", import.meta.url)),
);

async function get(url) {
  return new Promise((resolve, reject) => {
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
}

export function getNetwork(network) {
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
}

export const print = console.log;
export const printError = console.error;
export { config, get };
