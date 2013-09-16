var utils = require('./../utils'),
	RSVP = require('rsvp');

var BaseModel = utils.Class.extend({
	_model: null,
	_repository: null,
	_logger: null,
	_wrapper: null,

	_instanceId: null,
	_originalData: null,
	_data: null,
	_events: null,
	_conditions: null,
	_extensions: null,

	init: function (model, data) {
		throw new Error('This class is abstract and cannot be instantiated!');
	},

	on: function (event, callback) {},

	trigger: function (event) {},

	save: function () {
		return new RSVP.Promise(function (resolve, reject) {

		});
	},

	delete: function () {
		return new RSVP.Promise(function (resolve, reject) {

		});
	},

	reload: function () {
		return new RSVP.Promise(function (resolve, reject) {

		});
	}
});

module.exports = BaseModel;
