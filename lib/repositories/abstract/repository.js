var RSVP = require('rsvp'),
	utils = require('./../../utils'),
	_ = require('underscore');

var AbstractRepository = utils.Class.extend({
	_options: null,
	_logger: null,

	// Include the where functions
	where: null,

	
	init: function (options, loggerModule, driverModule) {
		throw new utils.Exceptions.AbstractClassException();
	},

	// Should return a promise interface
	getSchema: function () {},
	
	// Should return a promise interface
	find: function (model, options, conditions) {},

	// Should return a promise interface
	create: function (model, data) {},

	// Should return a promise interface
	save: function (model, data, primaryKey) {},

	// Should return a promise interface
	delete: function (model, primaryKey) {},

	reload: function (model, data) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			var conditions = [];

			// Build the where
			_.each(model.getPrimaryKey(), function (value) {
				conditions.push(new self.where.isEqual(value.getOriginalName(), data[value.getOriginalName()]));
			});

			self.find(model, {limit: 1}, conditions).then(function (newData) {
				return resolve(newData[0]);
			}, reject);
		});
	},

	_validateFields: function (model, obj) {
		_.each(model.getProperties(), function (property) {
			if (property.isRequired())
				if ( ! _.has(obj, property.getOriginalName()) || obj[property.getOriginalName()] === null)
					throw new utils.Exceptions.ValidationException('Object missing required field `'+property.getName()+'`!');
		});
	}
});

// Export the class
module.exports = AbstractRepository;