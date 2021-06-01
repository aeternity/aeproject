const fs = require('fs');
const path = require('path');

const get_contract_content = (contract_source) => {
    return fs.readFileSync(contract_source, 'utf8');
}

const get_filesystem = (contract_source) => {
    const default_includes = [
        'List.aes', 'Option.aes', 'String.aes',
        'Func.aes', 'Pair.aes', 'Triple.aes',
        'BLS12_381.aes', 'Frac.aes'
    ];
    const rgx = /^include\s+\"([\d\w\/\.\-\_]+)\"/gmi;
    const rgx_include_path = /"([\d\w\/\.\-\_]+)\"/gmi;
    const rgx_main_path = /.*\//g;

    const contract_content = get_contract_content(contract_source);
    let filesystem = {};

    const match = rgx.exec(contract_content);
    if(!match) {
        return filesystem;
    }
    let root_includes = contract_content.match(rgx);
    for (let i=0; i<root_includes.length; i++) {
        const contract_path = rgx_main_path.exec(contract_source);
        rgx_main_path.lastIndex = 0;
        const include_relative_path = rgx_include_path.exec(root_includes[i]);
        rgx_include_path.lastIndex = 0;
        if(default_includes.includes(include_relative_path[1])){
            console.log(`Skipping default include: ${include_relative_path[1]}`);
            continue;
        }
        console.log(`Adding include to filesystem: ${include_relative_path[1]}`);
        const include_path = path.resolve(`${contract_path[0]}/${include_relative_path[1]}`);
        try {
            const include_content = fs.readFileSync(include_path, 'utf-8');
            filesystem[include_relative_path[1]] = include_content;
        } catch (error) {
            throw Error(`File to include '${include_relative_path[1]}' not found.`);
        }
        Object.assign(filesystem, get_filesystem(include_path));
    }
    return filesystem;
}

module.exports = {
    get_contract_content,
    get_filesystem
};