const colors = require('./../colors');
const Table = require('cli-table');
const moment = require('moment');

const printReportTable = (recordActions) => {

    const table = new Table();
    
	let actionIndex = 0;
	for (const action of recordActions) {
		actionIndex++;
		
		table.push(
			{ 'Event Time': `${moment(action.eventTimestamp).format('D MMM, HH:MM:ss')}` },
			{ 'Executor': `${action.deployerType}` },
			{ 'Name or Label': `${colors.colorName(action.nameOrLabel)}` },
			{ 'Tx Hash': `${action.transactionHash}` },
			{ 'Status': `${getReadableStatus(action.status)}` },
			{ 'Gas Price': `${action.gasPrice}` },
			{ 'Gas Used': `${action.gasUsed}` },
			{ 'Result': `${action.result}` }
		);

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