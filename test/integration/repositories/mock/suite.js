var MockRepository = require('./../../../../lib/repositories/mock'),
	TestSuite = require('./../suite'),
	data = require('./../../../mock-data/data.json'),
	schema = require('./../../../mock-data/schema.json');

describe('Integration Test Suite', function () {
	var newData = JSON.parse(JSON.stringify(data)),
		newSchema = JSON.parse(JSON.stringify(schema)),
		repo = new MockRepository(newSchema, newData);

	// Pass the repository to the test suite
	return TestSuite(repo);
});