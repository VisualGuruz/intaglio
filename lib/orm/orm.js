var RSVP = require('rsvp'),
	_ = require('underscore'),
	utils = require('./../utils'),
	BaseModel= require('./basemodel'),
	Factory = require('./factory');

// ID counter to keep track of the next ID to be used when a model is instantiated
var nextId = 0;

var ORM = utils.Class.extend({
	/**
	 * Instance of the repository the ORM will use to retrieve data
	 * @member {Repository}
	 */
	_repository: null,

	/**
	 * Array of decorator objects used to decorate all models instantiated via the ORM.
	 * @member {Array}
	 */
	_decorations: null,

	/**
	 * Logger module used with the ORM. Should follow the console object's contract.
	 * @member {Object}
	 */
	_logger: null,

	/**
	 * Object that contains all the classes for the models.
	 * @member {Object}
	 */
	_classes: null,

	/**
	 * The schema object that the ORM uses to build the classes and talk to the repository.
	 * @member {Schema}
	 */
	_schema: null,

	/**
	 * The promise that is issued from parsing the schema from the repository. Used to track whether or not the ORM is
	 * ready to use yet.
	 * @member
	 */
	_readyPromise: null,

	/**
	 * Constructor for the ORM Class.
	 *
	 * @param repository
	 * @param loggerModule
	 */
	init: function (repository, loggerModule) {
		utils.assert('You must supply a repository to use the ORM!', repository !== undefined);

		this._repository = repository;
		this._logger = loggerModule || console;
		this._models = {};
		this._decorations = [];

		parseRepositorySchema(this);
	},

	ready: function () {
		return this._readyPromise;
	},

	factory: function (modelName) {
		utils.assert('Could not find the model `'+modelName+'`!', this._models[modelName] !== undefined);

		return new Factory(this, modelName);
	},

	/**
	 * Extends the classes that the ORM instantiates from the models. If overriding an existing method, the method's
	 * interface should match the original and should call this._super() so that existing contracts aren't broken and
	 * all base functionality is run. Failure to do this might break the ORM.
	 *
	 * @param {string} modelName Name of the model being extended
	 * @param {object} object Object of methods and properties that will extend the model
	 */
	extend: function (modelName, object) {
		var model = this._models[modelName];

		this._models[modelName] = model.extend(object);
	},

	decorate: function (decorator) {
		this._decorations.push(decorator);
	},

	getDecorations: function () {
		return this._decorations;
	},

	getSchema: function () {
		return this._schema;
	},

	getRepository: function () {
		return this._repository;
	},

	getClass: function (modelName) {
		return this._models[modelName];
	}
});

module.exports = ORM;


/**
 *       PRIVATE FUNCTIONS
 */

function parseRepositorySchema(orm) {
	orm._readyPromise = new RSVP.Promise(function (resolve, reject) {
		orm._repository.getSchema().then(function (schema) {
			orm._schema = schema;

			_.each(schema.getModels(), function (model) {
				orm._models[model.getName()] = generateModel(orm, model);
			});

			resolve(orm);
		}, reject);
	});
}

function generateModel(orm, model) {
	return BaseModel.extend({
		_orm: orm,
		_repository: orm._repository,
		_model: model,
		_logger: orm._logger,
		
		init: function (data, isNew) {
			// Set the instance ID for tracking
			this.setup(nextId, data, isNew);

			// Bump the next id
			nextId++;
		}
	});
}