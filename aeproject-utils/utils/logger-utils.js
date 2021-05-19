const colors = require('./colors-utils');
const Table = require('cli-table');
const moment = require('moment');

const TABLE_RAW_LENGTH = 100;

const printReportTable = (recordActions) => {

    const table = new Table();
    
    let actionIndex = 0;
    for (const action of recordActions) {
        actionIndex++;
        table.push(
            { 'Event Time': `${moment(action.eventTimestamp).format('D MMM, HH:mm:ss')}` },
            { 'Public Key': `${action.publicKey}` },
            { 'Executor': `${action.deployerType}` },
            { 'Name or Label': `${colors.colorName(action.nameOrLabel)}` },
            { 'Tx Hash': `${action.transactionHash ? action.transactionHash : ''}` },
            { 'Status': `${getReadableStatus(action.status)}` },
            { 'Gas Price': `${action.gasPrice ? action.gasPrice : ''}` },
            { 'Gas Used': `${action.gasUsed ? action.gasUsed : ''}` },
            { 'Result': `${action.result ? action.result : ''}` },
            { 'Network ID': `${action.networkId}` }
        );

        if (action.error) {
            table.push(
                { 'Error': `${action.error}` },
                { 'Init State': `${action.initState}` },
                { 'Options': `${action.options}` },
                { 'Raw Tx': `${action.rawTx ? sliceText(action.rawTx) : ''}` },
                { 'Verified Tx': `${ action.verifiedTx ? sliceText(JSON.stringify(action.verifiedTx)) : '' }` }
            )
        }

        if (recordActions.length > 1 && actionIndex < recordActions.length) {
            table.push({ '': '' });
        }
    }

    console.log(table.toString());
};

const getReadableStatus = (status) => {
    if (status) {
        return `${colors.colorSuccess('Success')}`
    }

    return `${colors.colorFailure('Fail')}`
};

function sliceText(text) {
    let textPieces = [];

    for (let i = 0; i < text.length; i += TABLE_RAW_LENGTH) {
        textPieces.push(text.substr(i, TABLE_RAW_LENGTH));
    }

    return textPieces.join('\n');
}

module.exports = {
    printReportTable,
    getReadableStatus
};