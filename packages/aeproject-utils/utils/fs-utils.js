const fs = require('fs-extra');
const dir = require('node-dir');
const path = require('path');

// Print helper
const print = (msg, obj) => {
    if (obj) {
        console.log(msg, obj)
    } else {
        console.log(msg)
    }
};

// Print error helper
const printError = (msg) => {
    console.log(msg)
};

const createMissingFolder = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};

const copyFileOrDir = (sourceFileOrDir, destinationFileOrDir, copyOptions = {}) => {
    if (fs.existsSync(`${ destinationFileOrDir }`) && !copyOptions.overwrite) {
        throw new Error(`${ destinationFileOrDir } already exists.`);
    }

    fs.copySync(sourceFileOrDir, destinationFileOrDir, copyOptions)
};

const getFiles = async function (directory, regex) {
    return new Promise((resolve, reject) => {
        dir.files(directory, (error, files) => {
            if (error) {
                reject(new Error(error));
                return;
            }

            files = files.filter(function (file) {
                return file.match(regex) != null;
            });

            resolve(files);
        });
    });
};

const readFile = (path, encoding = null, errTitle = 'READ FILE ERR') => {
    try {
        return fs.readFileSync(
            path,
            encoding
        )
    } catch (e) {
        switch (e.code) {
            case 'ENOENT':
                throw new Error('File not found')
            default:
                throw e
        }
    }
};

const writeFile = (path, content) => {
    fs.writeFileSync(path, content);
}

const writeFileRelative = async (relativePath, content = null) => {
    return writeFile(path.resolve(process.cwd(), relativePath), content);
}

const readFileRelative = (relativePath, encoding = null, errTitle = 'READ FILE ERR') => {
    return readFile(path.resolve(process.cwd(), relativePath), encoding, errTitle);
}

const fileExists = (relativePath) => {
    return fs.existsSync(path.resolve(process.cwd(), relativePath));
}

function deleteCreatedFiles (testFiles) {
    for (let testFile of testFiles) {
        fs.unlink(testFile);
    }
}

async function createDirIfNotExists (destination) {
    if (path.parse(destination).ext !== '') {
        const lastIndexOf = destination.lastIndexOf('/');
        destination = destination.substring(0, lastIndexOf);
    }

    await fs.ensureDir(destination);
}

module.exports = {
    print,
    printError,
    createMissingFolder,
    copyFileOrDir,
    getFiles,
    readFile,
    writeFile,
    writeFileRelative,
    readFileRelative,
    fileExists,
    deleteCreatedFiles,
    createDirIfNotExists
}