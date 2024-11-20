import { readFile } from "fs/promises";

const config = JSON.parse(
  await readFile(new URL("../config/config.json", import.meta.url)),
);

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
export { config };
