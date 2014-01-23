var AssertionException = function (message, constructor) {
	Error.captureStackTrace(this, constructor || this);
	this.message = message || 'An assertion made did not pass!';
};

inherits(AssertionException, Error);
AssertionException.prototype.name = 'AssertionException';

var ValidationException = function (message, constructor) {
	Error.captureStackTrace(this, constructor || this);
	this.message = message || 'Object did not pass validation!';
};

inherits(ValidationException, Error);
ValidationException.prototype.name = 'ValidationException';

var AbstractClassException = function (message, constructor) {
	Error.captureStackTrace(this, constructor || this);
	this.message = message || 'This class is abstract and cannot be instantiated!';
};

inherits(AbstractClassException, Error);
AbstractClassException.prototype.name = 'AbstractClassException';

var DeletedModelException = function (message, constructor) {
	Error.captureStackTrace(this, constructor || this);
	this.message = message || 'Deleted object access is not allowed!';
};

inherits(DeletedModelException, Error);
DeletedModelException.prototype.name = 'DeletedModelException';

var UnsavedModelException = function (message, constructor) {
	Error.captureStackTrace(this, constructor || this);
	this.message = message || "Model must be saved first!";
};

inherits(UnsavedModelException, Error);
UnsavedModelException.prototype.name = 'UnsavedModelException';

var ModelInstantiationException = function (message, constructor) {
	Error.captureStackTrace(this, constructor || this);
	this.message = message || "There was an error instantiating your model!";
};

inherits(ModelInstantiationException, Error);
ModelInstantiationException.prototype.name = 'ModelInstantiationException';

var RepositoryException = function (message, constructor) {
	Error.captureStackTrace(this, constructor || this);
	this.message = message || "There was an error in the repository!";
};

inherits(RepositoryException, Error);
RepositoryException.prototype.name = 'RepositoryException';

module.exports = {
	AssertionException: AssertionException,
	ValidationException: ValidationException,
	AbstractClassException: AbstractClassException,
	DeletedModelException: DeletedModelException,
	UnsavedModelException: UnsavedModelException,
	ModelInstantiationException: ModelInstantiationException,
	RepositoryException: RepositoryException
};


// Extract the util.inherits code so we don't pull half of node with us when we browserify
function inherits (ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
}