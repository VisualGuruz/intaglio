var utils = require('./../../utils'),
	_ = require('underscore'),
	AbstractSchema = require('./abstract'),
	Property = require('./property');
	
module.exports = AbstractSchema.extend({
	_properties: null,

	init: function (name, metadata) {
		// Set the name of the object
		this._setName(name);

		// Store the metadata
		this._metadata = metadata || {};

		this._properties = {};
	},

	addProperty: function (property) {
		utils.assert('`property` must be an instance of Schema.Property', property instanceof Property);
		utils.assert('Property must not already be defined in the model', this._properties[property.getName()] === undefined);
		this._properties[property.getName()] = property;

		return this;
	},

	getProperty: function (name) {
		return this._properties[utils.normalizeName(name)];
	},

	getProperties: function () {
		return this._properties;
	},

	getPrimaryKey: function () {
		var keys = [];

		for (var key in this._properties) {
			if (this._properties[key].isPrimaryKey())
				keys.push(this._properties[key].getName());
		}

		return keys;
	},

	getPropertyNames: function () {
		var names = [];

		for (var key in this._properties) {
			names.push(this._properties[key].getName());
		}

		return names;
	},

	getJSON: function () {
		var schema = {
			name: this.getName(),
			properties: {}
		};

		_.each(this.getProperties(), function (property) {
			schema.properties[property.getName()] = property.getJSON();
		});

		return schema;
	}
});