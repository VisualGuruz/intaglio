var RSVP = require('rsvp'),
	_ = require('underscore'),
	ORM = require('./orm'),
	repositories = require('../repositories');

// Base API object. Contains the pass-thrus for other parts of the orm
var api = {};

api.create = function create(options, repository, dataWrapper, loggerModule) {
	// Handle omitted options
	if (options instanceof repositories.abstract) {
		loggerModule = dataWrapper;
		dataWrapper = repository;
		repository = options;
		options = {};
	}

	return new RSVP.Promise(function (resolve, reject) {
		var newORM = new ORM(resolve, reject, options, repository, dataWrapper, loggerModule);
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