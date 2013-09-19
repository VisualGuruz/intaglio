var RSVP = require('rsvp'),
	_ = require('underscore'),
	utils = require('./../utils'),
	BaseModel= require('./basemodel'),
	Factory = require('./factory');

var nextId = 0;

var ORM = utils.Class.extend({
	_repository: null,
	_dataWrapper: null,
	_options: null,
	_logger: null,
	_models: null,
	_schema: null,

	init: function (repository, dataWrapper, options, loggerModule) {
		utils.assert('You must supply a repository to use the ORM!', repository !== undefined);

		this._repository = repository;
		this._dataWrapper = dataWrapper || require('./../wrappers').vanilla;
		this._logger = loggerModule || console;
		this._options = options;
		this._models = {};

		// Get the schema from the repository and parse it
		parseRepositorySchema(this);
	},

	factory: function (modelName) {
		utils.assert('Could not find the model `'+modelName+'`!', this._models[modelName] !== undefined);

		return new Factory(this, modelName);
	},

	extend: function (modelName, object) {
		var model = this._models[modelName];

		_.each(object, function (value) {
			utils.assert("Only functions are supported for extensions at this time.", _.isFunction(value));
		});

		this._models[modelName] = model.extend({
			_extensions: object
		});
	},

	getModelSchema: function (modelName) {
		utils.assert('Could not find the model `'+modelName+'`!', this._models[modelName] !== undefined);

		return this._schema[modelName];
	}
});

function parseRepositorySchema(orm) {
	orm._repository.getSchema().then(function (schema) {
		orm._schema = schema;
	});
	

	_.each(orm._schema, function (model, key) {
		orm._models[key] = generateModel(orm, model);
	});
}

function generateModel(orm, model) {
	return BaseModel.extend({
		_model: model,
		_repository: orm._repository,
		_logger: orm._logger,
		_wrapper: orm._dataWrapper,
		
		_getClass: function () {
			return orm._models[this._model.name];
		},

		init: function (data) {
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