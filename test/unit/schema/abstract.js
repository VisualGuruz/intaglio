var Schema = require('./../../../lib/schema'),
	utils = require('./../../../lib/utils'),
	should = require('chai').should(),
	expect = require('chai').expect;

describe('Abstract Schema Object Tests', function () {
	it('Should not allow you to directly instantiate', function () {
		var testFn = function () {var obj = new Schema.Abstract('someName');};

		testFn.should.throw(utils.Exceptions.AbstractClassException);
	});


});