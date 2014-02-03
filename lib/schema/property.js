var utils = require('./../utils'),
	AbstractSchema = require('./abstract'),
	_ = require('underscore');

module.exports = AbstractSchema.extend({
	_primaryKey: false,
	_required: false,
	_type: "String",
	_metadata: null,

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

	getPOJO: function () {
		return {
			name: this.getName(),
			type: this.getType(),
			primaryKey: this.isPrimaryKey(),
			required: this.isRequired()
		};
	},

	getMetadata: function () {
		return this._metadata;
	},

	_setName: function (name) {
		utils.assert('`name` is a required field!', name !== undefined);
		utils.assert('`name` must be a string!', _.isString(name));

		this._name = utils.normalizeName(name, false);
		this._originalName = name;
	}
});