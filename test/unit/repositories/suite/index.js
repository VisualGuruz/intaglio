var utils = require('./../../../../lib/utils'),
	RSVP = require('rsvp'),
	Schema = require('./../../../../lib/orm/schema'),
	chai = require('chai'),
	should = chai.should(),
	expect = chai.expect,
	mochaAsPromised = require("mocha-as-promised")(),
	chaiAsPromised = require("chai-as-promised"),
	rawData = require('./../../../mock-data/data.json');

chai.use(chaiAsPromised);

/**
 * Modularized integration test suite that can be run against any repository.
 * @param repository
 */
module.exports = function (repository) {
	describe('Schema Generation', function () {
		it('Should return a promise object', function () {
			return expect(repository.getSchema()).to.be.an.instanceOf(RSVP.Promise);
		});

		it('Should return a Schema object from the promise', function () {
			return repository.getSchema().should.eventually.be.an.instanceOf(Schema.Schema);
		});

		it('Should return a schema with the correct values', function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					expect(schema.getModelNames()).to.include.members(['person', 'photo']);
					expect(schema.getModel('person').getPropertyNames()).to.include.members(['id', 'firstName', 'lastName', 'email']);
					expect(schema.getModel('photo').getPropertyNames()).to.include.members(['id', 'personId', 'guid', 'dateCreated']);
					resolve();
				}).then(null, reject);
			});
		});
	});

	describe('Find', function () {
		it('Should find all data in the store for a model', function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					return repository.find(schema.getModel('person'))
				}).then(function (data) {
					expect(data).to.deep.equal(rawData.people);
				}).then(resolve, reject);
			});
		});
		it('Should find all data in the store for a model where a property is a value');
		it('Should find all data in the store for a model where a property is not a value');
		it('Should find all data in the store for a model where a property has a value in a range');
		it("Should find all data in the store for a model where a property's value is greater than a specified value");
		it("Should find all data in the store for a model where a property's value is greater than or equal to a specified value");
		it("Should find all data in the store for a model where a property's value is less than a specified value");
		it("Should find all data in the store for a model where a property's value is less than or equal to a specified value");
		it('Should find all data in the store for a model where a property is null');
		it('Should find all data in the store for a model where a property is not null');
		it('Should allow you to mix conditionals');
	});

	describe('Create', function () {
		it('Should allow you to create and object in the store');
	});

	describe('Save', function () {
		it('Should allow you to save an object in the store');
	});

	describe('Delete', function () {
		it('Should allow you to delete an object from the store');
	});
};