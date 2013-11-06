// Get dependencies
var mysql = require('mysql'),
	RSVP = require('rsvp'),
	_ = require('underscore'),
	utils = require('./../../utils');

var MySQLDriver = utils.Class.extend({
	pool: null,
	logger: null,

	init: function (opts, loggerModule) {
		// Validate the input
		utils.assert('`opts` must be an object!', _.isObject(opts));
		utils.assert('Options must have a host string!', _.isString(opts.host));
		utils.assert('Options must have a user string!', _.isString(opts.user));
		utils.assert('Options must have a password string!', _.isString(opts.password));
		utils.assert('Options must have a database string!', _.isString(opts.database));

		// Bring in the logger
		this.logger = loggerModule || console;

		this.pool = mysql.createPool(opts);
	},

	query: function (query) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			self.logger.info('Query:',query);

			// Get a connection to use
			self.pool.getConnection(function (err, connection) {
				// Check for errors
				if (err) return reject(err);

				// Make the query
				connection.query(query, function (err, result) {
					if (err) return reject(err);

					connection.release();

					self.logger.info('Returned '+result.length+' rows.');
					return resolve(result);
				});
			});
		});
	}
});

module.exports = MySQLDriver;