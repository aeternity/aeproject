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

const p = require('path');
const aeprojectTest = require('./aeproject-test');

const sophiaTest = require('./sophia-test');
const utils = require('aeproject-utils');

const run = async (path) => {

    let workingDirectory = process.cwd();

    if (path.includes('.js')) {
        await aeprojectTest.run([path]);

        return;
    }

    if (path.endsWith('./test')) {
        path = path.replace('./test', '');
    }

    let testDirectory;
    if (!workingDirectory.includes(path)) {
        testDirectory = p.join(workingDirectory, path);
    } else {
        testDirectory = workingDirectory;
    }

    if (path.includes('.aes')) {
        if (!workingDirectory.includes(path)) {
            path = p.join(workingDirectory, path);
        }

        sophiaTest.run([path], workingDirectory);

        return;
    }

    const files = await utils.getFiles(testDirectory + '/test', `.*\\.(js|es|es6|jsx|sol)$`);
    const aesFiles = await utils.getFiles(testDirectory + '/test', `.aes$`);

    let cwd = process.cwd()
    process.chdir(testDirectory);

    await aeprojectTest.run(files);
    await sophiaTest.run(aesFiles, testDirectory);

    process.chdir(cwd);
}

module.exports = {
    run
}