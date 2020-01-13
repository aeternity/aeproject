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

const util = require('util');
const pureExec = require('child_process').exec;
const exec = util.promisify(pureExec);
const path = require('path');
const open = require('open');

const constants = require('./constants.json');
const infoMessages = constants.MESSAGES;

const moduleName = constants.MODULE_NAME;

const isWindowsPlatform = process.platform === 'win32';

const run = async (options) => {

    try {
        let cwd = process.cwd();
        let npmGlobalPath = await getGlobalNpmRoot();
        npmGlobalPath = npmGlobalPath.stdout.replace('\n', '').trim();
        let modulePath = path.join(npmGlobalPath, moduleName);

        // check if repo is installed
        const isInstalled = await isFireEditorInstalled(moduleName);
        if (!isInstalled) {
            // install the repo
            console.log(`====== ${ infoMessages.START_INSTALLING } ======`);
            await installFireEditorRepo();
            process.chdir(modulePath);
            await installModuleDependencies();
        }

        // update Fire Editor Aepp
        if (options.update) {

            console.log(`====== ${ infoMessages.START_UPDATING } ======`);
            await installFireEditorRepo();
            process.chdir(modulePath);
            await installModuleDependencies();
            console.log(`====== ${ infoMessages.SUCCESSFUL_UPDATE } ======`);
        }

        // - set some options
        // -- set previous CWD to copy user contracts, keys, etc.
        
        // start fire editor
        console.log(`====== ${ infoMessages.STARTING_AEPP } ======`);
        process.chdir(modulePath);
        const openInBrowser = !(options.ignoreOpenInBrowser);
        startModule(openInBrowser);

    } catch (e) {
        console.error(e);
        throw Error(e);
    }
}

const isFireEditorInstalled = async (moduleName) => {

    try {
        let result = await exec('npm list -g --depth 0');
        return processNpmList(result.stdout, moduleName)
    } catch (error) {

        if (error.stdout) {
            return processNpmList(error.stdout, moduleName)
        } else {
            throw Error(error);
        }
    }

    function processNpmList (result, moduleName) {

        if (!moduleName.startsWith(' ')) {
            moduleName = ' ' + moduleName;
        }

        if (!moduleName.endsWith('@')) {
            moduleName += '@'
        }

        return result.indexOf(moduleName) >= 0;
    }
}

const installFireEditorRepo = async () => {
    await exec(`npm i -g ${ constants.MODULE_GITHUB_URL }`); 
}

const uninstallFireEditorRepo = async () => {
    await exec(`npm uninstall -g ${ constants.MODULE_GITHUB_URL }`); 
}

const getGlobalNpmRoot = async () => {
    return exec('npm root -g');
}

const startModule = async (shouldOpenInBrowser) => {
    // let childProcess = pureExec(constants.MODULE_START_CMD);

    let childProcess;
    if (!isWindowsPlatform) {
        childProcess = pureExec('npm run start');
    } else {
        childProcess = pureExec('npm run start-win');
    }
    
    childProcess.stdout.on('data', data => {
        console.log(data);

        if (shouldOpenInBrowser && data.indexOf('open your browser on') >= 0) {
            let tokens = data.split(/\s+/);
            for (let index in tokens) {
                if (tokens[index].startsWith('http')) {
                    
                    if(isWindowsPlatform){
                        tokens[index] = tokens[index].replace('localhost', '127.0.0.1')
                    }

                    open(tokens[index]);
                    break;
                }
            }
        } 
    });

    childProcess.stderr.on('data', data => {
        console.log(data);
    });
}

const installModuleDependencies = async () => {
    await exec('npm i');

    if (!isWindowsPlatform) {
        await exec('npm run init');
    } else {
        await exec('npm run init-win');
    }
}

module.exports = {
    run
};