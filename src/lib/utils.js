const fs = require('fs');
const path = require('path');

const getContractContent = (contractSource) => fs.readFileSync(contractSource, 'utf8');

const getFilesystem = (contractSource) => {
  const defaultIncludes = [
    'List.aes', 'Option.aes', 'String.aes',
    'Func.aes', 'Pair.aes', 'Triple.aes',
    'BLS12_381.aes', 'Frac.aes',
  ];
  const rgx = /^include\s+"([\d\w\/.\-_]+)"/gmi;
  const rgxIncludePath = /"([\d\w\/.\-_]+)"/gmi;
  const rgxMainPath = /.*\//g;

  const contractContent = getContractContent(contractSource);
  const filesystem = {};

  const rootIncludes = contractContent.match(rgx);
  if (!rootIncludes) return filesystem;

  for (const rootInclude of rootIncludes) {
    const contractPath = rgxMainPath.exec(contractSource);
    const includeRelativePath = rgxIncludePath.exec(rootInclude);

    if (defaultIncludes.includes(includeRelativePath[1])) continue;

    console.log(`==> Adding include to filesystem: ${includeRelativePath[1]}`);
    const includePath = path.resolve(`${contractPath[0]}/${includeRelativePath[1]}`);

    try {
      filesystem[includeRelativePath[1]] = fs.readFileSync(includePath, 'utf-8');
    } catch (error) {
      throw Error(`File to include '${includeRelativePath[1]}' not found.`);
    }

    Object.assign(filesystem, getFilesystem(includePath));
  }

  return filesystem;
};

module.exports = {
  getContractContent,
  getFilesystem,
};
