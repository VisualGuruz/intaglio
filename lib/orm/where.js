var utils = require('./../utils'),
	RSVP = require('rsvp'),
	_ = require('underscore');

var Where = utils.Class.extend({
	_factory: null,
	_field: null,
	_repository: null,

	init: function (factory, field) {
		utils.assert('Factory must be provided!', factory !== undefined);
		utils.assert('Field must be provided!', field !== undefined);

		this._factory = factory;
		this._field = field;
		this._repository = this._factory._repository;
	},

	isEqual: function (value) {
		this._factory._conditions.push(new this._repository.where.isEqual(this._field, value));

		return this._factory;
	},

	isNotEqual: function (value) {
		this._factory._conditions.push(new this._repository.where.isNotEqual(this._field, value));

		return this._factory;
	},

	isBetween: function (a, b) {
		this._factory._conditions.push(new this._repository.where.isBetween(this._field, [a,b]));

		return this._factory;
	},

	isGreaterThan: function (value) {
		this._factory._conditions.push(new this._repository.where.isGreaterThan(this._field, value));

		return this._factory;
	},

	isGreaterThanOrEqual: function (value) {
		this._factory._conditions.push(new this._repository.where.isGreaterThanOrEqual(this._field, value));

		return this._factory;
	},

	isLessThan: function (value) {
		this._factory._conditions.push(new this._repository.where.isLessThan(this._field, value));

		return this._factory;
	},

	isLessThanOrEqual: function (value) {
		this._factory._conditions.push(new this._repository.where.isLessThanOrEqual(this._field, value));

		return this._factory;
	},

	isNull: function () {
		this._factory._conditions.push(new this._repository.where.isNull(this._field));

		return this._factory;
	},

	isNotNull: function () {
		this._factory._conditions.push(new this._repository.where.isNotNull(this._field));

		return this._factory;
	}
});

module.exports = Where;