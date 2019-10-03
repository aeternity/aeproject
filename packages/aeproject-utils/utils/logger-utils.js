const colors = require('./colors-utils');
const Table = require('cli-table');
const moment = require('moment');

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
            { 'Tx Hash': `${action.transactionHash}` },
            { 'Status': `${getReadableStatus(action.status)}` },
            { 'Gas Price': `${action.gasPrice}` },
            { 'Gas Used': `${action.gasUsed}` },
            { 'Result': `${action.result}` },
            { 'Network ID': `${action.networkId}` }
        );

        if (action.error) {
            table.push(
                { 'Error': `${action.error}` },
                { 'Init State': `${action.initState}` },
                { 'Options': `${action.options}` }
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

module.exports = {
    printReportTable,
    getReadableStatus
};