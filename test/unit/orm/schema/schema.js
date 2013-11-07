var Schema = require('./../../../../lib/orm/schema'),
	utils = require('./../../../../lib/utils'),
	should = require('chai').should(),
	expect = require('chai').expect;

describe('Model Tests', function () {
	it('Should add a model to the schema', function () {
		var schema = new Schema.Schema(),
			model = new Schema.Model('someModel');

		schema.addModel(model)._models.should.have.property(model.getName(), model);
	});

	it('Should throw an exception if an invalid model is added', function () {
		var testFn = function () {
			var schema = new Schema.Schema();

			schema.addModel('Some Bogus Value');
		};

		testFn.should.throw(utils.Exceptions.AssertionException, '`model` must be an instance of Schema.Model');
	});

	it('Should not allow duplicate properties', function () {
		var testFn = function () {
			var schema = new Schema.Schema(),
				model = new Schema.Model('someModel');

			schema.addModel(model);

			// Add it again
			schema.addModel(model);
		};

		testFn.should.throw(utils.Exceptions.AssertionException, 'Model must not already be defined in the schema');
	});

	it('Should get a model that has been added by name', function () {
		var schema = new Schema.Schema(),
			model = new Schema.Model('some_model');

		schema.addModel(model).getModel('some_model').should.eql(model);
	});

	it('Should return all the model names', function () {
		var schema = new Schema.Schema(),
			model0 = new Schema.Model('someModel0'),
			model1 = new Schema.Model('someModel1');

		schema.addModel(model0).addModel(model1).getModelNames().should.eql(['someModel0', 'someModel1']);
	});


});