const fs = require('fs');
const path = require('path');

const getContractContent = (contractSource) => {
    return fs.readFileSync(contractSource, 'utf8');
}

const getFilesystem = (contractSource) => {
    console.log(`Creating filesystem by checking includes for: ${contractSource}`);
    const defaultIncludes = [
        'List.aes', 'Option.aes', 'String.aes',
        'Func.aes', 'Pair.aes', 'Triple.aes',
        'BLS12_381.aes', 'Frac.aes'
    ];
    const rgx = /^include\s+\"([\d\w\/\.\-\_]+)\"/gmi;
    const rgxIncludePath = /"([\d\w\/\.\-\_]+)\"/gmi;
    const rgxMainPath = /.*\//g;

    const contractContent = getContractContent(contractSource);
    let filesystem = {};

    const match = rgx.exec(contractContent);
    if(!match) {
        return filesystem;
    }
    let rootIncludes = contractContent.match(rgx);
    for (let i=0; i<rootIncludes.length; i++) {
        const contractPath = rgxMainPath.exec(contractSource);
        rgxMainPath.lastIndex = 0;
        const includeRelativePath = rgxIncludePath.exec(rootIncludes[i]);
        rgxIncludePath.lastIndex = 0;
        if(defaultIncludes.includes(includeRelativePath[1])){
            console.log(`=> Skipping default include: ${includeRelativePath[1]}`);
            continue;
        }
        console.log(`=> Adding include: ${includeRelativePath[1]}`);
        const includePath = path.resolve(`${contractPath[0]}/${includeRelativePath[1]}`);
        try {
            const includeContent = fs.readFileSync(includePath, 'utf-8');
            filesystem[includeRelativePath[1]] = includeContent;
        } catch (error) {
            throw Error(`File to include '${includeRelativePath[1]}' not found.`);
        }
        console.log(``);
        Object.assign(filesystem, getFilesystem(includePath));
    }
    console.log(``);
    return filesystem;
}

module.exports = {
    getContractContent,
    getFilesystem
};