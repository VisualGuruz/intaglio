// Get dependencies
var utils = require('./../../../utils');

var ResponseObject = utils.Class.extend({
	data: null,
	statusCode: null,
	logger: null,

	init: function (data, statusCode, loggerModule) {
		// Validate the input
		utils.assert('`data` is a required field!', data !== undefined);
		utils.assert('`statusCode` is a required field!', statusCode !== undefined);

		this.data = data;
		this.statusCode = statusCode;

		// Bring in the logger
		this.logger = loggerModule || console;
	}
});

module.exports = ResponseObject;