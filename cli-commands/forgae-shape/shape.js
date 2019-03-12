
const run = async () => {
    

	try {

		console.log(`Your deployment script finished successfully!`);
	} catch (error) {
		console.error(error);
		throw error
	}
};

module.exports = {
	run
};