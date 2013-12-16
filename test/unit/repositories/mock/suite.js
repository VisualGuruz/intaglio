var MockRepository = require('./../../../../lib/repositories/mock'),
	TestSuite = require('./../suite');

describe('Integration Test Suite', function () {
	var repo = new 	MockRepository();

	// Pass the repository to the test suite
	return TestSuite(repo);
});