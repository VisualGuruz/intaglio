var Schema = require('./../../../lib/schema'),
	utils = require('./../../../lib/utils'),
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

	it('Should have type default to "String"', function () {
		var prop = new Schema.Property('foo');

		prop.getType().should.equal('String');
	});

	it('Should take type as an argument on instantiation', function (){
		var prop = new Schema.Property('foo', 'bar');

		prop.getType().should.equal('bar');
	});

	it('Should store metadata provided at instantiation and allow you to retrieve it later', function () {
		var prop = new Schema.Property('foo', 'string', {bar: 'baz'});

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

	it('Should give you a plain object representation', function () {
		var prop = new Schema.Property('foo');

		prop.getPOJO().should.eql({
			name: 'foo',
			type: 'String',
			primaryKey: false,
			required: false
		});

		prop.makeRequired();
		prop.makePrimaryKey();

		prop.getPOJO().should.eql({
			name: 'foo',
			type: 'String',
			primaryKey: true,
			required: true
		});
	});
});