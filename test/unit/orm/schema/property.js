var Schema = require('./../../../../lib/orm/schema'),
	utils = require('./../../../../lib/utils'),
	should = require('chai').should(),
	expect = require('chai').expect;

describe('Property Tests', function () {
	it('Should throw an error if the name is not provided', function () {
		var testFunc = function () {
			var prop = new Schema.Property();
		};

		testFunc.should.throw(utils.Exceptions.AssertionException, '`name` is a required field!');
	});

	it('Should throw an error if the name is not a string', function () {
		var boolFn = function () {var prop = new Schema.Property(true);},
			objectFn = function () {var prop = new Schema.Property({});},
			numberFn = function () {var prop = new Schema.Property(123);};

			boolFn.should.throw(utils.Exceptions.AssertionException, '`name` must be a string!');
			objectFn.should.throw(utils.Exceptions.AssertionException, '`name` must be a string!');
			numberFn.should.throw(utils.Exceptions.AssertionException, '`name` must be a string!');

	});

	it('Should default to not being the primary key', function () {
		var prop = new Schema.Property('foo');

		prop.isPrimaryKey().should.be.false;
	});

	it('Should allow you to set it as part of the primary key', function () {
		var prop = new Schema.Property('foo');

		prop.makePrimaryKey();
		prop.isPrimaryKey().should.be.true;
	});

	it('Should store metadata provided at creation and allow you to retrieve it later', function () {
		var prop = new Schema.Property('foo', {bar: 'baz'});

		prop.getMetadata().should.have.property('bar', 'baz');
	});

	it('Should default to an empty object for metadata', function () {
		var prop = new Schema.Property('foo');

		prop.getMetadata().should.be.empty;
	});

	it('Should default to a non-required field', function () {
		var prop = new Schema.Property('foo');

		prop.isRequired().should.be.false;
	});

	it('Should allow you to set it as a required field', function () {
		var prop = new Schema.Property('foo');

		prop.makeRequired();
		prop.isRequired().should.be.true;
	});
});