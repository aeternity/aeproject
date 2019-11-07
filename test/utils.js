const {
    spawn
} = require('promisify-child-process');

const { LogNodeService } = require('../packages/aeproject-logger/logger-service/log-node-service');
let nodeService = new LogNodeService();
const {
    readSpawnOutput
} = require('../packages/aeproject-utils/index.js')

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

async function waitForContainer (image, options) {

    try {
        let running = false;

        let result = await getInfo(image, options);
        let res = readSpawnOutput(result);

        if (res) {
            res = res.split('\n');
        }

        if (Array.isArray(res)) {
            res.map(line => {
                if (line.indexOf(image) >= 0 && line.includes('healthy')) {
                    running = true;
                }
            })
        }

        return running;
    } catch (error) {
        if (error.stderr) {
            console.log(error.stderr.toString('utf8'));
        } else {
            console.log(error.message || error);
        }

        throw Error(error);
    }
}

async function getInfo (image, options) {
    let nodePath = nodeService.getNodePath();
    let compilerPath = nodeService.getCompilerPath();

    if (image && nodePath && compilerPath) {
        return spawn('docker-compose', [
            '-f',
            `${ nodePath }`,
            '-f',
            `${ compilerPath }`,
            'ps'
        ], options);
    } else if (image.indexOf('node') >= 0 && nodePath) {
        return spawn('docker-compose', ['-f', `${ nodePath }`, 'ps'], options);
    } else if (image.indexOf('compiler') >= 0 && compilerPath) {
        return spawn('docker-compose', ['-f', `${ compilerPath }`, 'ps'], options);
    } else {
        return spawn('docker-compose', [
            '-f',
            `${ 'docker-compose.yml' }`,
            '-f',
            `${ 'docker-compose.compiler.yml' }`,
            'ps'
        ], options);
    }
}

module.exports = {
    waitForContainer,
    waitUntilFundedBlocks,
    convertToPerson,
    countPhraseRepeats
}