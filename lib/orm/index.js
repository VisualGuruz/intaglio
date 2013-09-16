var RSVP = require('rsvp'),
	_ = require('underscore'),
	utils = require('./../utils'),
	BaseModel= require('./basemodel');

var api = {}, repo, wrapper, options, logger, models = {}, nextId = 0;

module.exports = function (opts, repository, dataWrapper, loggerModule) {
	utils.assert('Options is required and must be an object!', _.isObject(opts));
	utils.assert('You must supply a repository to use the ORM!', repository !== undefined);

	repo = repository;
	wrapper = dataWrapper || require('./../wrappers').vanilla;
	logger = loggerModule || console;

	// Get the schema from the repository and parse it
	parseRepositorySchema(repo.getSchema());

	// Return the api
	return api;
};

api.factory = function (modelName) {
	utils.assert('Could not find the model `'+modelName+'`!', models[modelName] !== undefined);

	return new models[modelName]();
};

api.extend = function (modelName, object) {
	var model = models[modelName];

	_.each(object, function (value) {
		utils.assert("Only functions are supported for extensions at this time.", _.isFunction(value));
	});

	models[modelName] = model.extend({
		_extensions: object
	});
};

function parseRepositorySchema(schema) {
	_.each(schema, function (model, key) {
		models[key] = generateModel(model);
	});
}

function generateModel(model) {
	return BaseModel.extend({
		_model: model,
		_repository: repo,
		_logger: logger,
		_wrapper: wrapper,
		
		_getClass: function () {
			return models[this._model.name];
		},

		init: function () {
			// Setup the instance vars
			this._originalData = {};
			this._data = {};
			this._events = {};
			this._conditions = [];

			// Set the instance ID for tracking
			this._instanceId = nextId;

			// Bump the next id
			nextId++;

			// Setup the fields
			_.each(this._model.fields, function (value, key) {
				this._originalData[key] = null;
				this._data[key] = null;
			});

			// If there is any data, set it up
			if (data) {
				_.each(data, function (value, key) {
					this._originalData[key] = value;
					this._data[key] = value;
				});
			}
		}
	});
}