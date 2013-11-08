var utils = require('./../../utils'),
	_ = require('underscore'),
	inflection = require('inflection');

module.exports = utils.Class.extend({
	_name: null,
	_originalName: null,
	_metadata: null,

	init: function (name, metadata) {
		// Set the name of the object
		this._setName(name);

		// Store the metadata
		this._metadata = metadata || {};

		// We don't actually want to instantiate this object, as it is abstract.
		throw new utils.Exceptions.AbstractClassException();
	},

	getName: function () {
		return this._name;
	},

	getOriginalName: function () {
		return this._originalName;
	},

	getMetadata: function () {
		return this._metadata;
	},

	_setName: function (name) {
		utils.assert('`name` is a required field!', name !== undefined);
		utils.assert('`name` must be a string!', _.isString(name));

		this._name = utils.normalizeName(name);
		this._originalName = name;
	}
});