var api = {},
	Exceptions = require('./exceptions');

module.exports = api;

api.assert = function (message, val) {
	if (val !== true)
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