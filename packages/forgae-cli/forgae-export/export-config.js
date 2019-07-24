const config = require('forgae-config');
const utils = require('forgae-utils');
const path = require('path');
const forgaeConfigDefaultFileName = require('./constants').forgaeConfigFileName;

const DEFAULT_NUMBER_OF_WALLETS = 3;

function exportMinerWallet (keypair) {

    return {
        minerWallet: {
            publicKey: keypair.publicKey,
            secretKey: keypair.secretKey
        }
    }
}

function exportWallets (defaultWallets) {

    let wallets = [];
    let index = 0;
    for (let defaultWallet of defaultWallets) {
        if (index >= DEFAULT_NUMBER_OF_WALLETS) {
            break;
        }

        wallets.push(
            { 
                publicKey: defaultWallet.publicKey,
                secretKey: defaultWallet.secretKey
            }
        );

        index++
    }

    return wallets;
}

function exportNodeConfiguration (config) {
    const localHostParams = config.localhostParams;

    const localhostConfig = {
        networkId: localHostParams.networkId,
        host: localHostParams.url,
        internalHost: `${ localHostParams.url }/internal`,
        compilerUrl: localHostParams.compilerUrl
    }

    return localhostConfig;

}

async function writeToFile (forgaeConfig, destination) {
    
    await utils.createDirIfNotExists(destination);
    if (!destination.endsWith('.json')) {
        destination = path.join(
            destination,
            forgaeConfigDefaultFileName
        );
    }

    utils.writeFileSync(destination, JSON.stringify(forgaeConfig));
}

async function run (options) {
        
    const localHostConfig = exportNodeConfiguration(config);
    const minerKeyPair = exportMinerWallet(config.keypair);
    const defaultWallets = exportWallets(config.defaultWallets);

    let forgaeConfig = Object.assign({}, localHostConfig);
    forgaeConfig = Object.assign(forgaeConfig, minerKeyPair);
    forgaeConfig.defaultWallets = defaultWallets; 

    console.log(JSON.stringify(forgaeConfig, null, 2));
    await writeToFile(forgaeConfig, options.path);
}

module.exports = {
    run
}