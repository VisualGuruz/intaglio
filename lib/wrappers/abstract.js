var RSVP = require('rsvp'),
	utils = require('./../utils');

var AbstractWrapper = utils.Class.extend({
	_object: null,

	init: function (object) {
		throw new utils.Exceptions.AbstractClassException();
	},

	get: function (key) {
		return this._object.get(key);
	},

	set: function (key, value) {
		return this._object.set(key, value);
	},

	on: function (event, callback) {
		return this._object.on(event, callback);
	},

	trigger: function (event) {
		return this._object.trigger(event);
	},

	save: function () {
		return this._object.save();
	},

	delete: function () {
		return this._object.delete();
	},

	reload: function () {
		return this._object.reload();
	},

	getRawData: function () {
		return this._object.getData();
	}
});

module.exports = AbstractWrapper;