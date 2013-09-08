var util = require('util');

var AssertionException = function (message, constructor) {
	Error.captureStackTrace(this, constructor || this);
	this.message = message || 'An assertion made did not pass!';
};

util.inherits(AssertionException, Error);
AssertionException.prototype.name = 'AssertionException';

module.exports = {
	AssertionException: AssertionException
};