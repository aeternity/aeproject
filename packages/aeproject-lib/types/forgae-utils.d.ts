import { Network } from "../contractTypes";
export class SophiaUtil {
    static generateCompleteSource(source: any, tests: any): any;
    static getContractInfo(contractPath: any): any;
    static getContractName(source: any): any;
    static getTestFunctions(source: any): any;
}
export const config: {
    compilerUrl: string;
    compilerVersion: string;
    config: {
        amountToFund: number;
        host: string;
        internalHost: string;
        keyPair: {
            publicKey: string;
            secretKey: string;
        };
    };
    defaultWallets: {
        publicKey: string;
        secretKey: string;
    }[];
    dockerConfiguration: {
        configFileName: string;
        dockerImage: string;
        textToSearch: string;
    };
    keypair: {
        publicKey: string;
        secretKey: string;
    };
    localCompiler: {
        dockerImage: string;
        imageVersion: string;
        port: number;
    };
    localhostParams: {
        networkId: string;
        url: string;
    };
    mainnetParams: {
        networkId: string;
        url: string;
    };
    testnetParams: {
        networkId: string;
        url: string;
    };
};
export function copyFileOrDir(sourceFileOrDir: any, destinationFileOrDir: any, copyOptions: any): void;
export function createMissingFolder(dir: any): void;
export function decodedHexAddressToPublicAddress(hexAddress: any): any;
export function deleteCreatedFiles(testFiles: any): void;
export function execute(cli: any, command: any, args: any, options: any): any;
/**
 * 
 * @param relativePath 
 * @type { string } 
 */
export function fileExists(relativePath: string): string;
export function aeprojectExecute(command: any, args: any, options: any): any;
export function generateKeyPairFromSecretKey(secretKey: any): any;
export function generatePublicKeyFromSecretKey(secretKey: any): any;
export function getClient(network: any, keypair: any): any;
export function getFiles(directory: any, regex: any): any;
export function getNetwork(network: string, networkId: string): Network;
export function getReadableStatus(status: any): any;
export function handleApiError(fn: any): any;
export function isKeyPair(k: any): any;
export function keyToHex(publicKey: any): any;
export function logApiError(error: any): void;
export function print(msg: any, obj: any): void;
export function printError(msg: any): void;
export function printReportTable(recordActions: any): void;
export function readFile(path: any, encoding: any, errTitle: any): any;
export function readFileRelative(relativePath: any, encoding: any, errTitle: any): any;
export function sleep(ms: any): void;
export function timeout(ms: any): any;
export function trimAdresseses(addressToTrim: any): any;
export function writeFileRelative(relativePath: any, content: any): any;