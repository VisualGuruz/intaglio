var utils = require('./../utils'),
	RSVP = require('rsvp'),
	_ = require('underscore');

var BaseModel = utils.Class.extend({
	_model: null,
	_repository: null,
	_logger: null,
	_wrapper: null,

	_instanceId: null,
	_originalData: null,
	_data: null,
	_events: null,
	_extensions: null,
	_isNew: true,
	_isDeleted: false,

	init: function () {
		throw new utils.Exceptions.AbstractClassException();
	},

	on: function (event, callback) {
		// Make sure object isn't deleted
		this._checkDeleted();

		if (this._events[event] === undefined)
			this._events[event] = [];

		this._events[event].push(callback);
	},

	trigger: function (event) {
		// Make sure object isn't deleted
		this._checkDeleted();

		// Do nothing if there are no events
		if (this._events[event] === undefined)
			return;

		var self = this;

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

	_checkDeleted: function () {
		if (this._isDeleted)
			throw new utils.Exceptions.DeletedModelException();
	},

	_parseData: function (data){
		var self = this;

		// Mark it as no longer new
		self._isNew = false;

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
