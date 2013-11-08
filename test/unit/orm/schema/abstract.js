var Schema = require('./../../../../lib/orm/schema'),
	utils = require('./../../../../lib/utils'),
	should = require('chai').should(),
	expect = require('chai').expect;

describe('Abstract Schema Object Tests', function () {
	var mockClass = Schema.Abstract.extend({
		init: function (name, metadata) {
			// Set the name of the object
			this._setName(name);

			// Store the metadata
			this._metadata = metadata || {};
		}
	});

	it('Should not allow you to directly instantiate', function () {
		var testFn = function () {var obj = new Schema.Abstract('someName');};

		testFn.should.throw(utils.Exceptions.AbstractClassException);
	});

	it('Should leave camelCase names alone', function () {
		var prop = new Schema.Property('camelCase');

		prop.getName().should.equal('camelCase');
	});

	it('Should normalize a snake_case name into camelCase', function () {
		var prop = new Schema.Property('snake_case');

		prop.getName().should.equal('snakeCase');
	});

	it('Should normalize a name with spaces into camelCase', function () {
		var prop = new Schema.Property('space case');

		prop.getName().should.equal('spaceCase');
	});

	it('Should normalize names with multiple spaces into camelCase', function () {
		var prop = new Schema.Property(' space  case ');

		prop.getName().should.equal('spaceCase');
	});

	it('Should normalize names with multiple underscores into camelCase', function () {
		var prop = new Schema.Property('___bad_snake__case___');

		prop.getName().should.equal('badSnakeCase');
	});

	it('Should singularize names', function () {
		var prop;

		prop = new Schema.Property('users');
		prop.getName().should.equal('user');

		prop = new Schema.Property('people');
		prop.getName().should.equal('person');

		prop = new Schema.Property('applications');
		prop.getName().should.equal('application');

		prop = new Schema.Property('apps');
		prop.getName().should.equal('app');

		prop = new Schema.Property('crazy people');
		prop.getName().should.equal('crazyPerson');

		prop = new Schema.Property('funny badgers');
		prop.getName().should.equal('funnyBadger');
	});

	it('Should give you the original name', function () {
		var prop = new Schema.Property('___bad_snake_case___');

		prop.getOriginalName().should.equal('___bad_snake_case___');
	});
});