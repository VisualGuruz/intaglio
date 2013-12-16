var utils = require('./../utils'),
	RSVP = require('rsvp'),
	_ = require('underscore');

/**
 * The BaseModel is what all Intaglio objects are extended from. It provides the base functionality
 * required to make a functioning ORM.
 * @type {*}
 */
var BaseModel = utils.Class.extend({
	/**
	 * Stores the schema of the object
	 */
	_model: null,

	/**
	 * Stores the repository that the object uses for persistence
	 */
	_repository: null,

	/**
	 * Stores an instance of the logging module to allow for different logging implementations.
	 */
	_logger: null,

	/**
	 * Stores the wrapper to be used with the object
	 */
	_wrapper: null,

	/**
	 * Unique ID used to track the objects that have been created in the system
	 */
	_instanceId: null,

	/**
	 * Stores the data of the object as it was when it was last loaded from persistence to use
	 * to check for deltas on `save()`.
	 */
	_originalData: null,

	/**
	 * Current data of the model.
	 */
	_data: null,

	/**
	 * Stores all the event listeners registered with the object
	 */
	_events: null,

	/**
	 * Stores extended functionality to the model. Not Yet Implemented.
	 */
	_extensions: null,

	/**
	 * Flag for maintaining the state of if the model is in persistence.
	 */
	_isNew: true,

	/**
	 * Flag for maintaining the state of the model being deleted
	 */
	_isDeleted: false,

	/**
	 * Flag for maintaining the state of the model's instantiation
	 */
	_isSetup: false,

	/**
	 * Initialization function. Throws an exception as the class is abstract.
	 */
	init: function () {
		throw new utils.Exceptions.AbstractClassException();
	},

	/**
	 * Simple eventing.
	 * @param event
	 * @param callback
	 */
	on: function (event, callback) {
		// Make sure object isn't deleted
		this._checkDeleted();

		// Setup the event container
		if (this._events[event] === undefined)
			this._events[event] = [];

		// Store the event handler
		this._events[event].push(callback);
	},

	trigger: function (event) {
		// Make sure object isn't deleted
		this._checkDeleted();

		// Do nothing if there are no events
		if (this._events[event] === undefined)
			return;

		var self = this;

		// Fire each callback registered to the event
		_.each(this._events[event], function (callback) {
			callback.apply(self);
		});
	},

	get: function (key) {
		// Make sure object isn't deleted
		this._checkDeleted();
		
		return this._data[key];
	},

	set: function (key, value) {
		// Make sure object isn't deleted
		this._checkDeleted();
		
		var self = this;

		// Handle passing objects
		if (_.isObject(key)) {
			_.each(key, function(v, k) {
				self._data[k] = v;
			});
		}
		else {
			this._data[key] = value;
		}

		return this;
	},

	save: function () {
		// Make sure object isn't deleted
		this._checkDeleted();
		
		var self = this;

		this.trigger('save');

		return new RSVP.Promise(function (resolve, reject) {
			var savePromise;

			// Do a create if it's new
			if (self._isNew) {
				savePromise = self._repository.create(self._model, self._data);
			}
			else {
				if (self.getFieldsPendingChange().length === 0)
					return resolve(new self._wrapper(self));

				savePromise = self._repository.save(self._model, self._data);
			}

			savePromise.then(function (data) {
				self._parseData(data);

				return resolve(new self._wrapper(self));
			}, reject);
		});
	},

	delete: function () {
		// Make sure object isn't deleted
		this._checkDeleted();
		
		var self = this;

		self.trigger('delete');

		return new RSVP.Promise(function (resolve, reject) {
			self._repository.delete(self._model, self._data).then(function () {
				// Mark it as dead
				self._isDeleted = true;

				return resolve();
			}, reject);
		});
	},

	reload: function () {
		// Make sure object isn't deleted
		this._checkDeleted();

		if (this._isNew)
			throw new utils.Exceptions.UnsavedModelException('Cannot reload a model that has not been saved!');
		
		var self = this;

		self.trigger('reload');

		return new RSVP.Promise(function (resolve, reject) {
			var conditions = [];

			self._repository.reload(self._model, self._data).then(function (data) {
				self._parseData(data);
				
				return resolve(new self._wrapper(self));
			}, reject);
		});
	},

	getData: function () {
		return _.extend({}, this._data);
	},

	getPrimaryKey: function () {
		return this._model.getPrimaryKey();
	},

	getModelName: function () {
		return this._model.getName();
	},

	getSchema: function () {
		return this._model;
	},

	getFieldsPendingChange: function () {
		var changes = [],
			self = this;

		_.each(this._data, function (value, key) {
			if (self._originalData[key] !== value)
				changes.push(key);
		});

		return changes;
	},

	setup: function (instanceId, data) {
		if (this._isSetup)
			throw new utils.Exceptions.ModelInstantiationException("Cannot call setup() on a model that has already been setup!");

		var self = this;

		// Setup the instance vars
		this._originalData = {};
		this._data = {};
		this._events = {};
		this._conditions = [];
		this._isSetup = true;
		this._instanceId = instanceId;

		// Setup the fields
		_.each(this._model.getProperties(), function (property) {
			self._originalData[property.getName()] = null;
			self._data[property.getName()] = null;
		});

		this._parseData(data, false);
	},

	_checkDeleted: function () {
		if (this._isDeleted)
			throw new utils.Exceptions.DeletedModelException();
	},

	_parseData: function (data, isNew){
		var self = this;

		if (isNew === undefined)
			isNew = true;

		// Mark it as no longer new
		self._isNew = isNew;

		// If there is any data, set it up
		if (data) {
			_.each(data, function (value, key) {
				var property = self._model.getProperty(key);

				if (property !== undefined){
					self._originalData[property.getName()] = value;
					self._data[property.getName()] = value;
				}
			});
		}
	}
});



module.exports = BaseModel;
