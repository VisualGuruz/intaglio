var util = require('util');

var AssertionException = function (message, constructor) {
	Error.captureStackTrace(this, constructor || this);
	this.message = message || 'An assertion made did not pass!';
};

util.inherits(AssertionException, Error);
AssertionException.prototype.name = 'AssertionException';

var ValidationException = function (message, constructor) {
	Error.captureStackTrace(this, constructor || this);
	this.message = message || 'Object did not pass validation!';
};

util.inherits(ValidationException, Error);
ValidationException.prototype.name = 'ValidationException';

module.exports = {
	AssertionException: AssertionException,
	ValidationException: ValidationException
};