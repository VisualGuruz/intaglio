var MockRepository = require('./../../../../lib/repositories/mock'),
	TestSuite = require('./../suite')
	data = require('./../../../mock-data/data.json'),
	schema = require('./../../../mock-data/schema.json');

describe('Integration Test Suite', function () {
	var repo = new MockRepository(schema, data);

	// Pass the repository to the test suite
	return TestSuite(repo);
});