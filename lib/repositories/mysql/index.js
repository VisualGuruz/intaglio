var _ = require('underscore'),
	RSVP = require('rsvp'),
	AbstractRepository = require('./../abstract/repository'),
	utils = require('./../../utils'),
	mysql = require('mysql'),
	Schema = require('./../../schema');

var MySQL = AbstractRepository.extend({
	_schemaPromise: null,

	init: function (options, loggerModule, driverModule) {
		this._options = options;
		this._logger = loggerModule || console;
		var driver = require('./driver');

		this._db = driverModule || new driver(this._options, this._logger);
		this.where = require('./where');
	},

	getSchema: function () {
		var self = this;

		// Only get the schema once
		if (this._schemaPromise)
			return this._schemaPromise;

		this._schemaPromise = new RSVP.Promise(function (resolve, reject) {
			self._db.query('SHOW TABLES').then(function (tables) {
				var schema = new Schema.Schema(),
					tableFetchers = [];

				// Get parse the table data and get it's stuff
				_.each(tables, function (table) {
					var name = _.values(table)[0],
						fetcher = self._db.query('SHOW FULL COLUMNS FROM '+name),
						model = new Schema.Model(name);

					tableFetchers.push(fetcher);

					fetcher.then(function (data) {
						_.each(data, function (column) {
							var property = new Schema.Property(column.Field, column.Type, {
									options: parseOptions(column.Comment),
									validation: []
								});

							if (column.Key === 'PRI')
								property.makePrimaryKey();

							if (column.Null === 'NO' && column.Extra !== 'auto_increment')
								property.makeRequired();

							model.addProperty(property);
						});

						schema.addModel(model);
					}, reject);
				});

				RSVP.all(tableFetchers).then(function(){
					return resolve(schema);
				}, reject);
			}, reject);
		});
		
		return this._schemaPromise;
	},
	
	find: function (model, options, conditions) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			options = options || {};

			var defaults = {
					limit: null,
					offset: null,
					orderBy: null,
					direction: null,
					from: model.getOriginalName(),
					where: conditions
				},

				queryObj = _.extend({}, defaults, options),

				query = buildSelectQuery(queryObj);

			self._db.query(query).then(function (result) {
				resolve(normalizeData(result));
			}, reject);
		});
	},

	create: function (model, data) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			self._validateFields(model, data);

			var dataKeys = _.keys(data),
				columns = {},
				query = 'INSERT INTO '+model.getOriginalName();

			_.each(dataKeys, function (key) {
				if (model.getProperty(key))
					columns[model.getProperty(key).getOriginalName()] = mysql.escape(data[key]);
			});

			query+= '(`' + _.keys(columns).join('`,`') + '`) VALUES(' + _.values(columns).join(',') + ')';

			self._db.query(query).then(function (result) {
				var conditions = [];

				_.each(model.getPrimaryKey(), function (value) {
					if (value.getOriginalName() === 'id' && _.isEmpty(data[value.getOriginalName()])) {
						conditions.push(new self.where.isEqual(value.getOriginalName(), result.insertId));
					}
					else
						conditions.push(new self.where.isEqual(value.getOriginalName(), data[value.getOriginalName()]));
				});

				return self.find(model, {limit: 1}, conditions);
			}, reject).then(function (newData) {
				return resolve(newData[0]);
			}, reject);
		});
	},

	save: function (model, originalData, data) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			self._validateFields(model, data);

			var dataKeys = _.keys(data),
				columns = [],
				query = 'UPDATE '+model.getOriginalName()+' SET ',
				conditions = [];

			// Build the where
			_.each(model.getPrimaryKey(), function (value) {
				conditions.push(new self.where.isEqual(value.getOriginalName(), originalData[value.getOriginalName()]));
			});

			_.each(dataKeys, function (key) {
				if (model.getProperty(key))
					columns.push('`'+model.getProperty(key).getOriginalName()+'`='+mysql.escape(data[key]));
			});

			query+= columns.join(',')+' '+parseWhereToQueryString(conditions);
				
			self._db.query(query).then(function (result) {
				return self.find(model, {limit: 1}, conditions);
			}).then(function (newData) {
				return resolve(newData[0]);
			}, reject);
		});
	},

	delete: function (model, data) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			var query = "DELETE FROM "+model.getOriginalName(),
				conditions = [];

			// Build the where
			_.each(model.getPrimaryKey(), function (value) {
				conditions.push(new self.where.isEqual(value.getOriginalName(), data[value.getOriginalName()]));
			});

			query+= ' '+parseWhereToQueryString(conditions)+' LIMIT 1';

			self._db.query(query).then(function (result) {
				resolve(result);
			}, reject);
		});
	}
});

// Export the class
module.exports = MySQL;


/**
 *       PRIVATE FUNCTIONS
 */


function normalizeData(data) {
	var normalizedData = [];

	data.forEach(function (row) {
		var newData = {};

		_.each(row, function (value, key) {
			newData[key] = value;
		});

		normalizedData.push(newData);
	});

	return normalizedData;
}

function buildSelectQuery(queryObj) {
	var baseQuery = {
			from: null,
			where: null,
			limit: null,
			offset: null,
			orderBy: null,
			direction: null
		},
		query = _.extend({}, baseQuery, queryObj);
		queryArray = [];

	// Push the query type
	queryPush('SELECT');

	// Push what we are querying
	queryPush(query.from+'.*');

	// Push From where
	queryPush('FROM '+query.from);

	queryPush(parseWhereToQueryString(query.where));

	if (query.orderBy) {
		queryPush('ORDER BY '+query.orderBy);
		if (query.direction)
			queryPush(normalizeDirection(query.direction));
	}

	if (query.limit)
		queryPush('LIMIT '+query.limit);

	if (query.offset)
		queryPush('OFFSET '+query.offset);

	return queryArray.join(' ').trim()+';';

	function queryPush(thing) {
		if (thing !== null && thing !== undefined)
			queryArray.push(thing);
	}
}

function parseWhereToQueryString (whereArray) {
	var where = ['WHERE'];

	_.each(whereArray, function (value) {
		where.push(value.toQuery());
		where.push('AND');
	});

	// Remove the last AND
	where.pop();

	return where.join(' ');
}

function normalizeDirection (direction) {
	if (direction == 'ascending')
		return 'ASC';
	else if (direction == 'descending')
		return 'DESC';
}

function parseOptions(comment) {
	if (comment.length === 0) return [];

	return comment.split(',');
}
