import { promisify } from "util";
import { exec as execCb } from "child_process";

export const exec = promisify(execCb);

export const print = console.log;
export const printError = console.error;
