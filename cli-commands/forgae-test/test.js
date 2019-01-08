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

const forgaeTest = require('./forgae-test');
const utils = require('../utils.js');

const run = async (path) => {
  let workingDirectory = process.cwd();

  if (path.includes('.js')) {
    await forgaeTest.run([path]);

    return;
  }

  testDirectory = path;

  if (!path.includes(workingDirectory)) {
    testDirectory = `${process.cwd()}/${path}`;
  }

  testDirectory = `${process.cwd()}/${path}`;
  const files = await utils.getFiles(`${process.cwd()}/${path}/`, `.*\\.(js|es|es6|jsx|sol)$`);

  await forgaeTest.run(files);
}

module.exports = {
  run
}