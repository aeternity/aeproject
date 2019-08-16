const dockerCLI = require('docker-cli-js');
const docker = new dockerCLI.Docker();

const waitForContainer = require('./../packages/aeproject-utils/index').waitForContainer;
const defaultAeDockerImage = require('./../packages/aeproject-config/index').nodeConfiguration.dockerImage;

async function waitUntilFundedBlocks (client, options) {
    if (!options.blocks) {
        options.blocks = 8;
    }
    
    await waitForContainer(options.dockerImage, options.options);
    await client.awaitHeight(options.blocks);
}

function convertToPerson (data) {

    let isNan = isNaN(data[1].value);
    if (!Array.isArray(data) || data.length !== 2 || isNan) {
        throw new Error('Cannot convert to "todo". Invalid data!');
    }

    return {
        name: data[0].value,
        age: data[1].value
    }
}

function countPhraseRepeats (text, phrase) {

    // prevent infinity loop
    const MAX_ITERATIONS = 100000;

    let count = 0;
    let index = 0;

    while (true) {

        index = text.indexOf(phrase, index);
        if (index < 0) {
            break;
        }

        index++;
        count++;

        if (count >= MAX_ITERATIONS) {
            throw new Error('Iteration limit reached or has infinity loop!')
        }
    }

    return count;
}

module.exports = {
    waitForContainer,
    waitUntilFundedBlocks,
    convertToPerson,
    countPhraseRepeats
}