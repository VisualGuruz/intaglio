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

	init: function () {
		throw new utils.Exceptions.AbstractClassException();
	},

	on: function (event, callback) {
		if (this._events[event] === undefined)
			this._events[event] = [];

		this._events[event].push(callback);
	},

	trigger: function (event) {
		// Do nothing if there are no events
		if (this._events[event] === undefined)
			return;

		var self = this;

		_.each(this._events[event], function (callback) {
			callback.apply(self);
		});
	},

	get: function (key) {
		return this._data[key];
	},

	set: function (key, value) {
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
		var self = this;

		this.trigger('save');

		return new RSVP.Promise(function (resolve, reject) {
			if (self._isNew) {

				self._repository.create(self._model, self._data).then(function(result){
					self._isNew = false;
					console.info('hmm')

					return resolve(self);
				}, reject);
			}
		});
	},

	delete: function () {
		var self = this;
		return new RSVP.Promise(function (resolve, reject) {
			self.trigger('delete');
		});
	},

	reload: function () {
		var self = this;
		return new RSVP.Promise(function (resolve, reject) {
			self.trigger('reload');
		});
	}
});

module.exports = BaseModel;
