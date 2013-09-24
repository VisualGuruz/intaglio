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

	save: function () {
		var self = this;
		return new RSVP.Promise(function (resolve, reject) {
			self.trigger('save');
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
