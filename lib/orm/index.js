var RSVP = require('rsvp'),
	_ = require('underscore'),
	ORM = require('./orm'),
	repositories = require('../repositories');

// Base API object. Contains the pass-thrus for other parts of the orm
var api = {};

api.create = function create(repository, loggerModule) {
	return new RSVP.Promise(function (resolve, reject) {
		var orm = new ORM(repository, loggerModule);

		orm.ready().then(resolve, reject);
	});
};

api.ready = function ready(ormHash) {
	return new RSVP.Promise(function (resolve, reject) {
		var promiseArray = [];

		_.each(ormHash, function (promise) {
			promiseArray.push(promise);
		});

		RSVP.all(promiseArray).then(function () {
			// Resolve with the original model since the promises are all complete
			resolve(ormHash);
		}, reject);
	});
};

module.exports = api;