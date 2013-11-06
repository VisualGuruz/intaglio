var utils = require('./../../utils'),
	_ = require('underscore'),
	SchemaModel = require('./model');

module.exports = utils.Class.extend({
	_models: null,

	init: function () {
		this._models = {};
	},

	addModel: function (model) {
		utils.assert('`model` must be an instance of Schema.Model', model instanceof SchemaModel);
		utils.assert('Model must not already be defined in the schema', this._models[model.getName()] === undefined);

		this._models[model.getName()] = model;

		return this;
	},

	getModel: function (name) {
		// Normalize the name so that it works from either direction
		return this._models[this._normalizeName(name)];
	},

	getModels: function () {
		return this._models;
	},

	getModelNames: function () {
		var names = [];

		_.each(this._models, function (value) {
			names.push(value.getName());
		});

		return names;
	},

	getJSON: function () {
		var schema = {};

		_.each(this.getModels, function (model) {
			var modelSchema = {};

			_.each(model.getProperties(), function (property) {
				var propertySchema = {
					name: property.getName(),
					primaryKey: property.isPrimaryKey(),
					required: property.isRequired()
				};

				modelSchema[property.getName()] = propertySchema;
			});
			schema[model.getName()] = modelSchema;
		});

		return schema;
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
	}
});