var utils = require('./../../utils'),
	_ = require('underscore');

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

	_normalizeName: function (name) {
		// Clean up the name and split it up into parts
		var parts = name.replace(/(\s|\_)+/g, ' ').trim().split(' ');

		// camelCase it!
		for (var i = 1, l = parts.length; i < l; i++) {
			parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
		}

		// Compile and return
		return parts.join('');
	},

	_setName: function (name) {
		utils.assert('`name` is a required field!', name !== undefined);
		utils.assert('`name` must be a string!', _.isString(name));

		this._name = this._normalizeName(name);
		this._originalName = name;
	}
});