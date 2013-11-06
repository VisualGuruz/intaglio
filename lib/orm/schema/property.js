var utils = require('./../../utils'),
	_ = require('underscore'),
	AbstractSchema = require('./abstract');

module.exports = AbstractSchema.extend({
	_primaryKey: false,
	_required: false,

	init: function (name, metadata) {
		// Set the name of the object
		this._setName(name);

		// Store the metadata
		this._metadata = metadata || {};
	},

	makePrimaryKey: function () {
		this._primaryKey = true;
	},

	isPrimaryKey: function () {
		return this._primaryKey;
	},

	makeRequired: function () {
		this._required = true;
	},

	isRequired: function () {
		return this._required;
	}
});