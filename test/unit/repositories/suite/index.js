var utils = require('./../../../../lib/utils'),
	should = require('chai').should(),
	expect = require('chai').expect;

/**
 * Modularized integration test suite that can be run against any repository.
 * @param repository
 */
module.exports = function (repository) {
	describe('Schema Generation', function () {
		it('Should generate a valid schema');
	});

	describe('Find', function () {
		it('Should find all data in the store');
		it('Should find all data in the store where a property is a value');
		it('Should find all data in the store where a property is not a value');
		it('Should find all data in the store where a property has a value in a range');
		it("Should find all data in the store where a property's value is greater than a specified value");
		it("Should find all data in the store where a property's value is greater than or equal to a specified value");
		it("Should find all data in the store where a property's value is less than a specified value");
		it("Should find all data in the store where a property's value is less than or equal to a specified value");
		it('Should find all data in the store where a property is null');
		it('Should find all data in the store where a property is not null');
	});

	describe('Create', function () {

	});

	describe('Save', function () {

	});

	describe('Delete', function () {

	});
};