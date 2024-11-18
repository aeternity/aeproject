#! /usr/bin/env node
import { program } from "commander";
import { initCommands } from "./cli/commands.js";
import { readFile } from "fs/promises";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url)),
);

function setupVersion() {
  program.version(packageJson.version);
}

function setupDefaultHandler() {
  program.on("command:*", () => {
    program.help();
  });
}

function setupCommands() {
  initCommands(program);
}

function parseParams() {
  program.parse(process.argv);
}

function presentHelpIfNeeded() {
  if (!program.args.length) program.help();
}

function run() {
  setupVersion();
  setupDefaultHandler();
  setupCommands();
  parseParams();
  presentHelpIfNeeded();
}

run();
