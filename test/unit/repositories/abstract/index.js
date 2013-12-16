var AbstractRepository = require('./../../../../lib/repositories/abstract/repository'),
	utils = require('./../../../../lib/utils'),
	should = require('chai').should(),
	expect = require('chai').expect;

describe('Abstract Repository', function () {
	it('Should not allow you to instantiate it', function () {
		var testFn = function () {var obj = new AbstractRepository();};

		testFn.should.throw(utils.Exceptions.AbstractClassException);
	});
});