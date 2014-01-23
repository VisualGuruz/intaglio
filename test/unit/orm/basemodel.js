var BaseModel = require('./../../../lib/orm/basemodel'),
    utils = require('./../../../lib/utils'),
    should = require('chai').should(),
    expect = require('chai').expect,
	sinon = require('sinon'),
	MockRepository = require('./../../../lib/repositories/mock'),
	rawData = require('./../../mock-data/data.json'),
	schema = require('./../../mock-data/schema.json');

// Trickery to get our own copy so that this test doesn't affect others
var data = JSON.parse(JSON.stringify(rawData)),
	repo = new MockRepository(schema, data);

describe('BaseModel Object Tests', function () {
	var MockClass = BaseModel.extend({
		init: function (mocks) {
			this._model = mocks.model;
			this._repository = mocks.repository;
			this._logger = mocks.logger;

			this.setup(5, mocks.data);
		}
	});

	describe('Instantiation', function () {
		it('Should not let you instantiate it', function () {
			var test = function () {
				(function (model) {/* NOOP */})(new BaseModel());
			};

			test.should.throw(utils.Exceptions.AbstractClassException);
		});

		it('Should not let you setup the model multiple times', function() {
			return repo.getSchema().then(function (schema) {
				var baseData = data.people[0],
					testObj = new MockClass({
						model: schema.getModel('person'),
						repository: repo,
						logger: console,
						data: baseData
					}),
					test = function () {
						testObj.setup();
					};

				expect(test).to.throw(utils.Exceptions.ModelInstantiationException);
			});
		});
	});

	describe('Accessors and Mutators', function () {
		it('Should get values from the object', function () {
			return repo.getSchema().then(function (schema) {
				var baseData = data.people[0],
					testObj = new MockClass({
						model: schema.getModel('person'),
						repository: repo,
						logger: console,
						data: baseData
					});

				expect(testObj.get('id')).to.equal(baseData.id);
				expect(testObj.get('firstName')).to.equal(baseData.first_name);
				expect(testObj.get('lastName')).to.equal(baseData.last_name);
			});
		});

		it('Should set values to the object', function () {
			return repo.getSchema().then(function (schema) {
				var baseData = data.people[0],
					testObj = new MockClass({
						model: schema.getModel('person'),
						repository: repo,
						logger: console,
						data: baseData
					});

				testObj.set('id', 999);
				testObj.set({
					firstName: 'foo',
					lastName: 'manchoo'
				});

				expect(testObj.get('id')).to.equal(999);
				expect(testObj.get('firstName')).to.equal('foo');
				expect(testObj.get('lastName')).to.equal('manchoo');
			});
		});
	});

	it('Should save the values to the object', function () {
		return repo.getSchema().then(function (schema) {
			var baseData = data.people[0],
				testObj = new MockClass({
					model: schema.getModel('person'),
					repository: repo,
					logger: console,
					data: baseData
				});

			testObj.set('id', 999);
			testObj.set({
				firstName: 'foo',
				lastName: 'manchoo'
			});

			expect(testObj.get('id')).to.equal(999);
			expect(testObj.get('firstName')).to.equal('foo');
			expect(testObj.get('lastName')).to.equal('manchoo');
		});
	});



	describe('Eventing', function () {
		it('Should only let you use functions for event handlers', function () {
			return repo.getSchema().then(function (schema) {
				var baseData = data.people[0],
					testObj = new MockClass({
						model: schema.getModel('person'),
						repository: repo,
						logger: console,
						data: baseData
					}),
					testFuncString = function () {
						testObj.on('test', "test");
					},
					testFuncObject = function () {
						testObj.on('test', {});
					},
					testFuncBool = function () {
						testObj.on('test', true);
					},
					testFuncNumber = function () {
						testObj.on('test', 123);
					},
					testFuncArray = function () {
						testObj.on('test', []);
					};

				expect(testFuncString).to.throw(utils.Exceptions.AssertionException);
				expect(testFuncObject).to.throw(utils.Exceptions.AssertionException);
				expect(testFuncBool).to.throw(utils.Exceptions.AssertionException);
				expect(testFuncNumber).to.throw(utils.Exceptions.AssertionException);
				expect(testFuncArray).to.throw(utils.Exceptions.AssertionException);
			});
		});

		it('Should allow you set custom event handlers', function () {
			return repo.getSchema().then(function (schema) {
				var baseData = data.people[0],
					testObj = new MockClass({
						model: schema.getModel('person'),
						repository: repo,
						logger: console,
						data: baseData
					}),
					eventHandler = sinon.spy();

				testObj.on('test', eventHandler);

				expect(testObj._events).to.not.be.empty;
				expect(testObj._events.test).to.not.be.empty;
				expect(testObj._events.test).to.include(eventHandler);
			});
		});

		it('Should allow you set multiple handlers for the same event', function () {
			return repo.getSchema().then(function (schema) {
				var testObj = new MockClass({
						model: schema.getModel('person'),
						repository: repo,
						logger: console,
						data: data.people[5]
					}),
					eventHandler0 = sinon.spy(),
					eventHandler1 = sinon.spy();

				testObj.on('test', eventHandler0);
				testObj.on('test', eventHandler1);

				expect(testObj._events.test).to.include(eventHandler0);
				expect(testObj._events.test).to.include(eventHandler1);
			});
		});

		it('Should fire each event handler when the event is triggered', function () {
			return repo.getSchema().then(function (schema) {
				var baseData = data.people[0],
					testObj = new MockClass({
						model: schema.getModel('person'),
						repository: repo,
						logger: console,
						data: baseData
					}),
					eventHandler0 = sinon.spy(),
					eventHandler1 = sinon.spy();

				testObj.on('test', eventHandler0);
				testObj.on('test', eventHandler1);

				testObj.trigger('test');

				expect(eventHandler0.calledOnce).to.be.true;
				expect(eventHandler1.calledOnce).to.be.true;
			});
		});

		it('Should fire event handlers for multiple triggers', function () {
			return repo.getSchema().then(function (schema) {
				var baseData = data.people[0],
					testObj = new MockClass({
						model: schema.getModel('person'),
						repository: repo,
						logger: console,
						data: baseData
					}),
					eventHandler0 = sinon.spy(),
					eventHandler1 = sinon.spy();

				testObj.on('test', eventHandler0);
				testObj.on('test', eventHandler1);

				testObj.trigger('test');
				testObj.trigger('test');

				expect(eventHandler0.calledTwice).to.be.true;
				expect(eventHandler1.calledTwice).to.be.true;
			});
		});

		it('Should allow you to trigger an event that has no handlers', function () {
			return repo.getSchema().then(function (schema) {
				var baseData = data.people[0],
					testObj = new MockClass({
						model: schema.getModel('person'),
						repository: repo,
						logger: console,
						data: baseData
					});

				testObj.trigger('test');
			});
		});
	});

	describe('Deleted Object Tests', function () {
		it('Should not allow getting values from a deleted object', function () {
			return repo.getSchema().then(function (schema) {
				var baseData = data.people[0],
					testObj = new MockClass({
						model: schema.getModel('person'),
						repository: repo,
						logger: console,
						data: baseData
					});


				return testObj.delete();
			}).then(function (testObj) {
				var test = function () {
					expect(testObj.get('id')).to.equal(baseData.id);
				};

				expect(test).to.throw(utils.Exceptions.DeletedModelException);
			});
		});

		it('Should not allow you set custom event handlers if object has been deleted', function () {
			return repo.getSchema().then(function (schema) {
				var baseData = data.people[0],
					testObj = new MockClass({
						model: schema.getModel('person'),
						repository: repo,
						logger: console,
						data: baseData
					});

				return testObj.delete();
			}).then(function (testObj) {
				var test = function () {
					testObj.on('test', function () {});
				};

				expect(test).to.throw(utils.Exceptions.DeletedModelException);
			});
		});

		it('Should not allow you to trigger events when deleted', function () {
			return repo.getSchema().then(function (schema) {
				var baseData = data.people[0],
					testObj = new MockClass({
						model: schema.getModel('person'),
						repository: repo,
						logger: console,
						data: baseData
					});

				return testObj.delete();
			}).then(function (testObj) {
				var test = function () {
					testObj.trigger('test');
				};

				expect(test).to.throw(utils.Exceptions.DeletedModelException);
			});
		});
	});
});