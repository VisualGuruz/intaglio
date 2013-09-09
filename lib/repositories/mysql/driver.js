// Get dependencies
var mysql = require('mysql'),
	RSVP = require('rsvp'),
	_ = require('underscore'),
	utils = require('./../../utils');

// Setup the global vars
var api = {}, logger;

module.exports = function init(opts, loggerModule) {
	// Validate the input
	utils.assert('`opts` must be an object!', _.isObject(opts));
	utils.assert('Options must have a host string!', _.isString(opts.host));
	utils.assert('Options must have a user string!', _.isString(opts.user));
	utils.assert('Options must have a password string!', _.isString(opts.password));
	utils.assert('Options must have a database string!', _.isString(opts.database));

	// Bring in the logger
	logger = loggerModule || console;

	var pool = mysql.createPool(opts);

	// Return the API
	return linkApiToPool(pool);
};

/**
 * Gotta curry the pool into the api functions so we can have multiple db instances.
 * @param  {Object} pool MySQL connection pool
 * @return {Object}      The public API with the pool curried
 */
function linkApiToPool(pool) {
	var curriedApi = {};

	for (var name in api) {
		curriedApi[name] = utils.curry(api[name], null, pool);
	}

	return curriedApi;
}

api.query = function (pool, query) {
	return new RSVP.Promise(function (resolve, reject) {
		logger.info('Query:',query);

		// Get a connection to use
		pool.getConnection(function (err, connection) {
			// Check for errors
			if (err) return reject(err);

			// Make the query
			connection.query(query, function (err, result) {
				if (err) return reject(err);

				connection.release();

				return resolve(result);
			});
		});
	});
};
