#! /usr/bin/env node

const program = require('commander');

const commands = require('./cli/commands');
const packageJson = require('../package.json');

const setupVersion = () => {
  program.version(packageJson.version);
};

const setupDefaultHandler = () => {
  program.on('command:*', () => {
    program.help();
  });
};

const setupCommands = () => {
  commands.initCommands(program);
};

const parseParams = () => {
  program.parse(process.argv);
};

const presentHelpIfNeeded = () => {
  if (!program.args.length) program.help();
};

const run = () => {
  setupVersion();
  setupDefaultHandler();
  setupCommands();
  parseParams();
  presentHelpIfNeeded();
};

run();
