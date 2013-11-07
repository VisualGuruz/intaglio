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

var AbstractClassException = function (message, constructor) {
	Error.captureStackTrace(this, constructor || this);
	this.message = message || 'This class is abstract and cannot be instantiated!';
};

util.inherits(AbstractClassException, Error);
AbstractClassException.prototype.name = 'AbstractClassException';

var DeletedModelException = function (message, constructor) {
	Error.captureStackTrace(this, constructor || this);
	this.message = message || 'Deleted object access is not allowed!';
};

util.inherits(DeletedModelException, Error);
DeletedModelException.prototype.name = 'DeletedModelException';

var UnsavedModelException = function (message, constructor) {
	Error.captureStackTrace(this, constructor || this);
	this.message = message || "Model must be saved first!";
};

util.inherits(UnsavedModelException, Error);
UnsavedModelException.prototype.name = 'UnsavedModelException';

module.exports = {
	AssertionException: AssertionException,
	ValidationException: ValidationException,
	AbstractClassException: AbstractClassException,
	DeletedModelException: DeletedModelException,
	UnsavedModelException: UnsavedModelException
};