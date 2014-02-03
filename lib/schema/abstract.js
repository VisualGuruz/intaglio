var utils = require('./../utils'),
	_ = require('underscore');

module.exports = utils.Class.extend({
	_name: null,
	_originalName: null,

	init: function () {
		// We don't actually want to instantiate this object, as it is abstract.
		throw new utils.Exceptions.AbstractClassException();
	},

	getName: function () {
		return this._name;
	},

	getOriginalName: function () {
		return this._originalName;
	}
});