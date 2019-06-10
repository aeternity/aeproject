export const compilerUrl: string;
export const compilerVersion: string;
export const config: {
    amountToFund: number;
    host: string;
    internalHost: string;
    keyPair: {
        publicKey: string;
        secretKey: string;
    };
};
export const defaultWallets: {
    publicKey: string;
    secretKey: string;
}[];
export const dockerConfiguration: {
    configFileName: string;
    dockerImage: string;
    textToSearch: string;
};
export const keypair: {
    publicKey: string;
    secretKey: string;
};
export const localCompiler: {
    dockerImage: string;
    imageVersion: string;
    port: number;
};
export const localhostParams: {
    networkId: string;
    url: string;
};
export const mainnetParams: {
    networkId: string;
    url: string;
};
export const testnetParams: {
    networkId: string;
    url: string;
};
