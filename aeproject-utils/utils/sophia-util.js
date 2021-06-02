const utils = require('./fs-utils');

// TODO: insert and use 'Assert' 
// const assertInterface = `
// contract Assert =
//     public function require : (bool,string) => ()

// `;

class SophiaUtil {
    static getContractInfo (contractPath) {
        const contracts = new Map();

        if (!Array.isArray(contractPath)) {
            const result = parseContractInfo(contractPath);
            return contracts.set(result.contractName, result);
        }

        for (let path of contractPath) {

            const result = parseContractInfo(path);

            if (contracts.has(result.contractName)) {
                const existingContract = contracts.get(result.contractName);

                throw new Error(`Duplicate contract's name exists!
                Name: ${ result.contractName }
                Duplicate contract: Path: ${ result.path }. 
                Existing contract: Path ${ existingContract.path }`);
            }

            contracts.set(result.contractName, result);
        }

        return contracts;
    }

    static getContractName (source) {
        let rgx = /^contract\s+([a-zA-Z\d_\-]+)/gm;
        let match = rgx.exec(source);

        if (!match || match.length < 2 || !match[1]) {
            throw new Error(`Invalid contract. Missing contract name. Source: ${ source }`);
        }

        return match[1];
    }

    static getTestFunctions (source) {

        const functions = [];
        const rgx = /^\s+(?:stateful\s+)?entrypoint\s+([a-zA-Z\'_\d]+)/gm;

        let match = rgx.exec(source);
        while (match) {
            if (match.length >= 2 && match[1].startsWith('test_')) {
                functions.push(match[1]);
            }
            match = rgx.exec(source);
        }

        return functions;
    }

    static generateCompleteSource (source, tests) {
        // index of 'space/new line' before first public function
        const rgx = /^\s+entrypoint/gm;

        let match = rgx.exec(tests);
        if (!match) {
            throw new Error(`Missing public function! Data: ${ tests }`);
        }
        tests = tests.substr(match.index);
        return `${ source }\n${ tests }`;
    }
}

function parseContractInfo (contractPath) {

    const source = utils.readFile(contractPath, 'utf8');
    const contractName = SophiaUtil.getContractName(source);
    const functions = SophiaUtil.getTestFunctions(source);
    return {
        contractName: contractName,
        source: source,
        testFunctions: functions,
        path: contractPath
    }
}

module.exports = SophiaUtil;