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


describe('Decorators', function () {
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

	it('Should set a decorator on all objects from the ORM', function () {
		var spy = sinon.spy();
		orm.decorate({
			decoration: function () {
				spy();
			}
		});


		return orm.factory('person').find().then(function (person) {
			person.decoration();

			expect(spy.callCount).to.equal(1);
		});
	});

	it('Should set multiple decorators on all objects from the ORM and execute them in order', function () {
		var spy = sinon.spy();

		orm.decorate({
			decoration: function () {
				expect(spy.callCount).to.equal(0);
				spy();
			}
		});

		// Decorate again
		orm.decorate({
			decoration: function () {
				var ret = this.decoration.apply(this, arguments);

				expect(spy.callCount).to.equal(1);
				spy();

				return ret;
			}
		});


		return orm.factory('person').find().then(function (person) {
			person.decoration();

			expect(spy.callCount).to.equal(2);
		});
	});

	it('Should be able to override functionality of the model while still having access to the original function', function () {
		var spy = sinon.spy();
		orm.decorate({
			get: function () {
				spy();
				return this.get.apply(this, arguments);
			}
		});


		return orm.factory('person').find().then(function (person) {
			expect(person.get('id')).to.equal(1);

			expect(spy.callCount).to.equal(1);
		});
	});

});