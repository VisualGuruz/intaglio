var MySQLRepository = require('./../../../../lib/repositories/mysql'),
	MockDriver = require('./../../../../lib/repositories/mysql/mock/driver'),
	TestSuite = require('./../suite'),
	data = require('./../../../mock-data/data.json'),
	schema = require('./../../../mock-data/schema.json');

describe('Integration Test Suite', function () {
	var newData = JSON.parse(JSON.stringify(data)),
		newSchema = JSON.parse(JSON.stringify(schema)),
		driver = new MockDriver(newSchema, newData),
		repo = new MySQLRepository(null, null, driver);

	// Pass the repository to the test suite
	return TestSuite(repo);
});