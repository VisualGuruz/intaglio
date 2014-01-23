var RestRepository = require('./../../../../lib/repositories/rest'),
	TestSuite = require('./../suite'),
	data = require('./../../../mock-data/data.json'),
	schema = require('./../../../mock-data/schema.json');

describe('Integration Test Suite', function () {
	var newData = JSON.parse(JSON.stringify(data)),
		newSchema = JSON.parse(JSON.stringify(schema)),
		driver = new RestRepository.Drivers.Mock(newSchema, newData),
		repo = new RestRepository(driver);

	// Pass the repository to the test suite
	return TestSuite(repo);
});