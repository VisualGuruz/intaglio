var Schema = require('./../../../lib/schema'),
	utils = require('./../../../lib/utils'),
	should = require('chai').should(),
	expect = require('chai').expect;

describe('Model Tests', function () {
	it('Should throw an error if the name is not provided', function () {
		var testFunc = function () {
			var prop = new Schema.Model();
		};

		testFunc.should.throw(utils.Exceptions.AssertionException, '`name` is a required field!');
	});

	it('Should throw an error if the name is not a string', function () {
		var boolFn = function () {var prop = new Schema.Model(true);},
			objectFn = function () {var prop = new Schema.Model({});},
			numberFn = function () {var prop = new Schema.Model(123);};

			boolFn.should.throw(utils.Exceptions.AssertionException, '`name` must be a string!');
			objectFn.should.throw(utils.Exceptions.AssertionException, '`name` must be a string!');
			numberFn.should.throw(utils.Exceptions.AssertionException, '`name` must be a string!');

	});

	it('Should add a property to the model and retrieve all properties that were added', function () {
		var prop = new Schema.Property('someProperty'),
			prop2 = new Schema.Property('someProperty2'),
			model = new Schema.Model('someModel'),
			props;

		props = model.addProperty(prop).addProperty(prop2).getProperties();

		props.should.have.property(prop.getName(), prop);
		props.should.have.property(prop2.getName(), prop2);
	});

	it('Should throw an exception if an invalid property is added', function () {
		var testFn = function () {
			var model = new Schema.Model('someModel');

			model.addProperty('Some Bogus Value');
		};

		testFn.should.throw(utils.Exceptions.AssertionException, '`property` must be an instance of Schema.Property');
	});

	it('Should not allow duplicate properties', function () {
		var testFn = function () {
			var prop = new Schema.Property('someProperty'),
				model = new Schema.Model('someModel');

			model.addProperty(prop);

			// Add it again
			model.addProperty(prop);
		};

		testFn.should.throw(utils.Exceptions.AssertionException, 'Property must not already be defined in the model');
	});

	it('Should get a property that has been added by name', function () {
		var prop = new Schema.Property('someProperty'),
			model = new Schema.Model('someModel');

		model.addProperty(prop).getProperty('someProperty').should.equal(prop);
	});

	it('Should get the primary key for the model', function () {
		var prop1 = new Schema.Property('someProperty1'),
			prop2 = new Schema.Property('someProperty2'),
			prop3 = new Schema.Property('someProperty3'),
			model = new Schema.Model('someModel');

		// Handle single key PKs
		prop1.makePrimaryKey();

		model.addProperty(prop1).addProperty(prop2).addProperty(prop3);

		model.getPrimaryKey().should.have.length(1);
		model.getPrimaryKey().should.contain(prop1);

		// Handle multiple key PKs
		prop2.makePrimaryKey();

		model.getPrimaryKey().should.have.length(2);
		model.getPrimaryKey().should.include(prop2);
	});

	it('Should give you a plain object representation', function () {
		var prop1 = new Schema.Property('someProperty1'),
			prop2 = new Schema.Property('someProperty2'),
			prop3 = new Schema.Property('someProperty3'),
			model = new Schema.Model('someModel');

		prop1.makePrimaryKey();

		model.addProperty(prop1).addProperty(prop2).addProperty(prop3);

		model.getPOJO().should.eql({
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
		});
	});
});