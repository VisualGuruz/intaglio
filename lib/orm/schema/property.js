var utils = require('./../../utils'),
	_ = require('underscore'),
	AbstractSchema = require('./abstract');

module.exports = AbstractSchema.extend({
	_primaryKey: false,
	_required: false,
	_type: "String",

	init: function (name, type, metadata) {
		// Set the name of the object
		this._setName(name);
		this._type = type || this._type;

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
	},

	getType: function () {
		return this._type;
	},

	getJSON: function () {
		return {
			name: this.getName(),
			type: this.getType(),
			primaryKey: this.isPrimaryKey(),
			required: this.isRequired()
		};
	}
});