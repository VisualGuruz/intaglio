var _ = require('underscore'),
	RSVP = require('rsvp'),
	AbstractRepository = require('./../abstract/repository'),
	utils = require('./../../utils'),
	Schema = require('./../../schema');

var REST = AbstractRepository.extend({
	// Include the where functions
	where: null,
	_schemaPromise: null,
	_driver: null,

	init: function (driverModule, loggerModule) {
		utils.assert("A driver must be provided!", driverModule !== undefined)
		this._logger = loggerModule || console;

		this._driver = driverModule;
		this.where = require('./where');
	},

	getSchema: function () {
		var self = this;

		// Only get the schema once
		if (this._schemaPromise)
			return this._schemaPromise;

		this._schemaPromise = new RSVP.Promise(function (resolve, reject) {
			self._driver.get('/schema').then(function (response) {
				var schema = new Schema.Schema();
				
				// Parse the schema
				_.each(response.data, function (model) {
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

				resolve(schema);
			}, reject);
		});
		
		return this._schemaPromise;
	},
	
	find: function (model, options, conditions) {
		var self = this;

		options = options || {};

		return new RSVP.Promise(function (resolve, reject) {
			var url = '/api/'+model.getOriginalName(),
				pk = null;

			_.each(conditions, function (condition, index) {
				if (model.getProperty(condition.field).isPrimaryKey() && condition instanceof self.where.isEqual)
					pk = condition.value;
			});

			if (pk !== null) {
				// No need to do all the other stuff
				url+= '/'+pk;

				self._driver.get(url).then(function (response) {
					if (response.statusCode !== 200)
						return resolve([]);

					return resolve([response.data]);
				}, reject);
			}
			else {
				var defaults = {
					limit: null,
					offset: null,
					orderBy: null,
					direction: null,
					from: model.getOriginalName(),
					where: conditions
				};

				url+= buildUrl(_.extend({}, defaults, options));

				self._driver.get(url).then(function (response) {
					if (response.statusCode !== 200)
						return resolve([]);
					
					resolve(response.data._embedded[model.getOriginalName()]);
				}, reject);
			}
		});
	},

	create: function (model, data) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			self._validateFields(model, data);

			var dataKeys = _.keys(data),
				rawData = {},
				url = '/api/'+model.getOriginalName();

			_.each(dataKeys, function (key) {
				if (model.getProperty(key))
					rawData[model.getProperty(key).getOriginalName()] = data[key];
			});

			self._driver.post(url, rawData).then(function (result) {
				var conditions = [];

				_.each(model.getPrimaryKey(), function (value) {
					if (value.getOriginalName() === 'id' && _.isEmpty(data[value.getOriginalName()]))
						conditions.push(new self.where.isEqual(value.getOriginalName(), result.data.id));

					else
						conditions.push(new self.where.isEqual(value.getOriginalName(), data[value.getOriginalName()]));
				});

				self.find(model, {}, conditions).then(function (newData) {
					return resolve(newData[0]);
				}, reject);
			}, reject);
		});
	},

	save: function (model, originalData, data) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			var dataKeys = _.keys(data),
				columns = {},
				url = '/api/'+model.getOriginalName()+'/',
				pk = null,
				conditions = [];

			// Build the where
			_.each(model.getPrimaryKey(), function (value) {
				pk = originalData[value.getOriginalName()];
				conditions.push(new self.where.isEqual(value.getOriginalName(), data[value.getOriginalName()]));
			});

			url+= pk;

			_.each(dataKeys, function (key) {
				if (model.getProperty(key))
					columns[model.getProperty(key).getOriginalName()] = data[key];
			});

			self._driver.put(url, columns).then(function (result) {
				self.find(model, {limit: 1}, conditions).then(function (newData) {
					return resolve(newData[0]);
				}, reject);
			}, reject);
		});
	},

	delete: function (model, data) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			var url = "/api/"+model.getOriginalName(),
				conditions = [];

			// Build the where
			_.each(model.getPrimaryKey(), function (value) {
				url+= '/'+data[value.getOriginalName()];
			});

			self._driver.delete(url).then(function (result) {
				resolve(result.data);
			}, reject);
		});
	},

	reload: function (model, data) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			var conditions = [];

			// Build the where
			_.each(model.getPrimaryKey(), function (value) {
				conditions.push(new self.where.isEqual(value, data[value]));
			});
			
			self.find(model, {limit: 1}, conditions).then(function (newData) {
				return resolve(newData[0]);
			}, reject);
		});
	}
});

// Export the class
module.exports = REST;


/**
 *       PRIVATE FUNCTIONS
 */


function buildUrl(queryObj) {
	var baseQuery = {
			from: null,
			where: null,
			limit: null,
			offset: null,
			orderBy: null,
			direction: null
		},
		query = _.extend({}, baseQuery, queryObj),
		url = parseWhereToQueryString(query.where);

	if (query.orderBy) {
		url+='&_order='+query.orderBy;
		if (query.direction)
			url+=':'+query.direction;
	}

	if (query.limit)
		url+='&_limit='+query.limit;

	if (query.offset)
		url+='&_offset='+query.offset;

	return url;
}

function parseWhereToQueryString (whereArray) {
	var where = [];

	if (whereArray === undefined || whereArray.length === 0)
		return '';

	_.each(whereArray, function (value) {
		where.push(value.toQuery());
	});

	return '?'+where.join('&');
}