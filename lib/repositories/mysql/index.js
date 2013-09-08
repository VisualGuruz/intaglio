var _ = require('underscore'),
	RSVP = require('rsvp');

// Set up the API object for return
var api = {};

var options, db, logger;

module.exports = function  (opts, loggerModule) {
	db = require('./driver')(opts.connection);

	options = opts;

	logger = loggerModule || console;

	// Return the public API
	return api;
};

api.getSchema = function () {
	return new RSVP.Promise(function (resolve, reject) {
		db.query('SHOW TABLES').then(function (result) {
			var schema = {},
				tableFetchers = [];

			_.each(result, function(value, key) {
				var tblName = _.values(value)[0],
					fetcher = db.query('EXPLAIN '+tblName);

				tableFetchers.push(fetcher);

				fetcher.then(function (tblData) {
					schema[tblName] = tblData;
				}, reject);
			});

			RSVP.all(tableFetchers).then(function(){
				return resolve(schema);
			}, reject);
		}, reject);
	});
};