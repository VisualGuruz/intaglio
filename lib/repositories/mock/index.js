var _ = require('underscore'),
	RSVP = require('rsvp'),
	AbstractRepository = require('./../abstract/repository'),
	utils = require('./../../utils'),
	Schema = require('./../../schema');

/**
 * Mock repository to use with tests
 * @type {*}
 */
var MockRepository = AbstractRepository.extend({
	_schemaPromise: null,
	_logger: console,
	where: require('./where'),
	_data: null,

	_rawSchema: null,
	_rawData: null,

	init: function (rawSchema, rawData) {
		this._rawSchema = rawSchema;
		this._data = rawData;
	},

	getSchema: function () {
		var self = this;

		// Only get the schema once
		if (this._schemaPromise)
			return this._schemaPromise;

		this._schemaPromise = new RSVP.Promise(function (resolve, reject) {
			var rawSchema = self._rawSchema,
				schema = new Schema.Schema();

			_.each(rawSchema, function (model) {
				var modelSchema = new Schema.Model(model.name);

				_.each(model.properties, function (property) {
					var propertySchema = new Schema.Property(property.name, property.type);

					if (property.primaryKey)
						propertySchema.makePrimaryKey();

					if (property.required)
						propertySchema.makeRequired();

					modelSchema.addProperty(propertySchema);
				});

				schema.addModel(modelSchema);
			});

			return resolve(schema);
		});

		return this._schemaPromise;
	},

	find: function (model, options, conditions) {
		var self = this;

		options = options || {};

		return new RSVP.Promise(function (resolve, reject) {
			try {
				var data = self._data[model.getOriginalName()].slice(0),
					defaults = {
						limit: null,
						offset: null,
						orderBy: null,
						direction: null,
						from: model.getOriginalName(),
						where: conditions
					},
					combinedOptions = _.extend({}, defaults, options),
					returnData = [];

				_.each(conditions, function (condition) {
					data = condition.filter(data);
				});

				if (combinedOptions.orderBy !== null) {
					if (combinedOptions.direction !== "descending")
						data = orderBy(data, model.getProperty(combinedOptions.orderBy).getOriginalName());
					else
						data = orderBy(data, model.getProperty(combinedOptions.orderBy).getOriginalName(), true);
				}

				if (combinedOptions.offset !== null)
					data = offset(data, combinedOptions.offset);

				if (combinedOptions.limit !== null)
					data = limit(data, combinedOptions.limit);

				// Clone the objects
				_.each(data, function (item) {
					returnData.push(_.extend({}, item));
				});

				return resolve(returnData);
			}
			// Catch any errors and reject the promise
			catch (err) {
				return reject(err);
			}
		});
	},

	create: function (model, data) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			try {
				self._validateFields(model, data);

				var dataKeys = _.keys(data),
					rawData = {},
					pk = model.getPrimaryKey();

				_.each(dataKeys, function (key) {
					if (model.getProperty(key))
						rawData[model.getProperty(key).getOriginalName()] = data[key];
				});

				_.each(pk, function (key) {
					// If the PK isn't set, get the largest value from the dataset, increment it by one, and use it
					if (data[key.getOriginalName()] === undefined || data[key.getOriginalName()] === null) {
						var newId = _.max(self._data[model.getOriginalName()], function (item) {
							return item[key.getOriginalName()];
						})[key.getOriginalName()] + 1;

						rawData[key.getOriginalName()] = newId;
					}
				});

				self._data[model.getOriginalName()].push(rawData);

				return resolve(rawData);
			}
			catch (err) {
				return reject(err);
			}
		});
	},

	save: function (model, originalData, data) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			try {
				self._validateFields(model, data);

				var conditions = {},
					findConditions = [],
					obj = null,
					dataKeys = _.keys(data);

				_.each(model.getPrimaryKey(), function (key) {
					conditions[key.getOriginalName()] = originalData[key.getOriginalName()];
					findConditions.push(new self.where.isEqual(model, originalData[key.getOriginalName()]));
				});

				obj = _.where(self._data[model.getOriginalName()], conditions);

				if (obj.length > 1)
					throw new utils.Exceptions.RepositoryException("More than one object found in the store while trying to lookup for save!");

				if (obj.length === 0)
					throw new utils.Exceptions.RepositoryException("No data found in the store to save against!");

				_.each(dataKeys, function (key) {
					obj[0][key] = data[key];
				});

				self.find(model, {}, findConditions).then(function (data) {
					resolve(data[0]);
				}).then(null, reject);
			}

			catch (err) {
				return reject(err);
			}
		});
	},

	delete: function (model, data) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			try {
				var conditions = {}, obj;

				_.each(model.getPrimaryKey(), function (key) {
					conditions[key.getOriginalName()] = data[key.getOriginalName()];
				});

				obj = _.where(self._data[model.getOriginalName()], conditions);

				if (obj.length > 1)
					throw new utils.Exceptions.RepositoryException("More than one object found in the store while trying to lookup for delete!");

				if (obj.length === 0)
					throw new utils.Exceptions.RepositoryException("Could not find the object in the store to delete!");

				self._data[model.getOriginalName()].splice(_.indexOf(self._data[model.getOriginalName()], obj[0]), 1);

				return resolve();
			}

			catch (err) {
				return reject(err);
			}
		});
	}
});

// Export the class
module.exports = MockRepository;


/**
 *       PRIVATE FUNCTIONS
 */

function limit (data, length) {
	return data.slice(0, length);
}

function offset (data, position) {
	return data.slice(position);
}

function orderBy (data, field, reverse) {
	if (reverse === undefined)
		reverse = false;

	if (reverse)
		return _.sortBy(data, function (item) {
			return item[field];
		}).reverse();
	else
		return _.sortBy(data, function (item) {
			return item[field];
		});
}