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

	it('Should give you a plain object representation', function () {
		var schema = new Schema.Schema(),
			prop1 = new Schema.Property('someProperty1'),
			prop2 = new Schema.Property('someProperty2'),
			prop3 = new Schema.Property('someProperty3'),
			model = new Schema.Model('someModel');

		prop1.makePrimaryKey();

		model.addProperty(prop1).addProperty(prop2).addProperty(prop3);

		schema.addModel(model);

		schema.getJSON().should.eql({
			someModel: {
				name: "someModel",
				properties: {
					someProperty1: {
						name: 'someProperty1',
						type: 'String',
						primaryKey: true,
						required: false
					},
					someProperty2: {
						name: 'someProperty2',
						type: 'String',
						primaryKey: false,
						required: false
					},
					someProperty3: {
						name: 'someProperty3',
						type: 'String',
						primaryKey: false,
						required: false
					}
				}
			}
		});
	});
});