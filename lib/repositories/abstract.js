var RSVP = require('rsvp'),
	utils = require('./../utils');

var AbstractRepository = utils.Class.extend({
	_options: null,
	_logger: null,
	_db: null,

	init: function (options, loggerModule, driverModule) {
		throw new utils.Exceptions.AbstractClassException();
	},

	// Should return a promise interface
	getSchema: function () {
		return new RSVP.Promise(function (resolve, reject) {

		});
	},
	
	// Should return a promise interface
	find: function (model, options, conditions) {
		return new RSVP.Promise(function (resolve, reject) {

		});
	},

	// Should return a promise interface
	create: function (model, data) {
		return new RSVP.Promise(function (resolve, reject) {

		});
	},

	// Should return a promise interface
	save: function (model, data, primaryKey) {
		return new RSVP.Promise(function (resolve, reject) {

		});
	},

	// Should return a promise interface
	delete: function (model, primaryKey) {
		return new RSVP.Promise(function (resolve, reject) {

		});
	}
});

// Export the class
module.exports = AbstractRepository;