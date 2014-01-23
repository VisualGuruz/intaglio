var utils = require('./../../../lib/utils'),
	chai = require('chai'),
	should = chai.should(),
	sinon = require('sinon'),
	expect = chai.expect,
	_ = require('underscore'),
	MockRepository = require('./../../../lib/repositories/mock'),
	data = require('./../../mock-data/data.json'),
	schema = require('./../../mock-data/schema.json'),
	ORM = require('./../../../lib/orm');


describe('Extending Models', function () {
	var repo, orm;

	beforeEach(function (done) {
		var newData = JSON.parse(JSON.stringify(data)),
			newSchema = JSON.parse(JSON.stringify(schema));

		repo = new MockRepository(newSchema, newData);

		ORM.create(repo).then(function (newOrm) {
			orm = newOrm;
			done();
		}, done);
	});

	it('Should be able to extend a model with additional functionality', function () {
		var spy = sinon.spy();
		orm.extend('person', {
			spy: spy
		});


		return orm.factory('person').find().then(function (person) {
			person.spy();

			expect(spy.callCount).to.equal(1);
		});
	});

	it('Should only affect the model being extended', function () {
		var spy = sinon.spy();
		orm.extend('person', {
			spy: spy
		});


		return orm.factory('photo').find().then(function (photo) {
			expect(photo.spy).to.not.exist;
		});
	});

	it('Should still be able to type check against the original class', function () {
		var spy = sinon.spy(),
			clss = orm.getClass('person');

		orm.extend('person', {
			spy: spy
		});

		return orm.factory('person').find().then(function (person) {
			expect(person).to.be.an.instanceOf(clss);
		});
	});
});