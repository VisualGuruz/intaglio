var api = {},
	Exceptions = require('./exceptions'),
	inflection = require('inflection'),
	_ = require('underscore');

module.exports = api;

/**
 * Asserts that the condition passed is true.
 * @param message
 * @param condition
 */
api.assert = function assert (message, condition) {
	if (condition !== true)
		throw new Exceptions.AssertionException(message);
};

api.Class = require('./class').Class;

api.Exceptions = Exceptions;

/**
 * Helper for currying a function.
 *
 * ### Usage
 *
 * ```javascript
 * // Some function you want to partially apply
 * function someFunc(a, b, c, d) {return arguments;}
 *
 * // Curry the function
 * var curriedFunc = curry(someFunc, null, 'a', 'b');
 *
 * // Returns `['a', 'b', 'c', 'd']`
 * curriedFunc('c', 'd');
 * ```
 * 
 * @param  {Function} fn        Function to be curried
 * @param  {mixed}   context    Context the function will be called in
 * @param  {...number} var_args Arguments to partially apply to the function to be called
 * @return {function}           Function with partially applied arguments
 */
api.curry = function (fn, context) {
	// Container for the arguments to call the function with
	var baseArgs = [];

	// Get the arguments to be partially applied
	for (var i = 2, l = arguments.length; i < l; i++) {
		baseArgs.push(arguments[i]);
	}

	// Return a wrapper function
	return function () {
		var args = baseArgs.slice(0);
		// Get the args to call the function with and add them to the args array
		for (var i = 0, l = arguments.length; i < l; i++) {
			args.push(arguments[i]);
		}

		// Call the function with the provided context and arguments
		return fn.apply(context, args);
	};
};

api.normalizeName = function normalizeName (name, singularize) {
	// Set defaults
	if (singularize === undefined)
		singularize = true;

	api.assert("Name must be a string", _.isString(name));

	// Clean up the name and split it up into parts
	var parts = name.replace(/(\s|\_)+/g, ' ').trim().split(' '),
		newName, word;

	// Singularize it if necessary
	if (singularize) {
		if (parts.length === 1) {
			// There's only one word in the name
			parts[0] = inflection.singularize(parts[0]);
		}

		else {
			// Only singularize the last word
			word = parts.pop();

			parts.push(inflection.singularize(word));
		}
	}

	// Recombine
	newName = parts.join('_');

	// Camelize and return
	return inflection.camelize(inflection.underscore(newName), true);
};

/**
 * Overrides the model's method with a new method that has access to original methods
 * @param model
 * @param name
 * @param method
 */
api.overrideMethod = function overrideMethod (model, name, method) {
	var originalMethod = model[name] || api.noop,
		newMethod = function () {
			var returnVal;

			// Store the _super() method to revert things back to as they were
			var tmp = model._super;

			model._super = originalMethod;

			// Fire off the method with the proper context
			returnVal = method.apply(model, arguments);

			model._super = tmp;

			return returnVal;
		};

	model[name] = newMethod;
};

api.decorateObject = function decorateObject (obj, decorations) {
	// Apply the decorations
	_.each(decorations, function (decoration) {
		// Override the methods
		_.each(decoration, function (method, name) {
			api.assert("Decorator method must be a function!", _.isFunction(method));
			api.overrideMethod(obj, name, method);
		});
	});

	return obj;
};

api.instantiateModel = function instantiateModel (orm, model, data, isNew) {
	var obj = new model(data, isNew),
		decorations = orm.getDecorations();

	api.decorateObject(obj, decorations);

	return obj;
};

api.noop = function noop () {
	/* NOOP */
};