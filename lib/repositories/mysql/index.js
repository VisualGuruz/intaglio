var _ = require('underscore'),
	RSVP = require('rsvp'),
	AbstractRepository = require('./../abstract/repository'),
	utils = require('./../../utils'),
	mysql = require('mysql');

var MySQL = AbstractRepository.extend({
	// Include the where functions
	where: require('./where'),

	init: function (options, loggerModule, driverModule) {
		this._options = options;
		this._logger = loggerModule || console;
		driver = driverModule || require('./driver');

		this._db = new driver(this._options, this._logger);
	},

	getSchema: function () {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			self._db.query('SHOW TABLES').then(function (result) {
				var schema = {},
					tableFetchers = [];

				_.each(result, function(value, key) {
					var tblName = _.values(value)[0],
						fetcher = self._db.query('SHOW FULL COLUMNS FROM '+tblName),
						normalizedTableName = normalizeName(tblName);

					schema[normalizedTableName] = {
						name: normalizedTableName,
						_tableName: tblName,
						primaryKey: null
					};

					tableFetchers.push(fetcher);

					fetcher.then(function (tblData) {
						schema[normalizedTableName].fields = parseColumns(tblData);

						var pk = _.where(schema[normalizedTableName].fields, {primaryKey: true});

						if (pk.length === 1)
							schema[normalizedTableName].primaryKey = [pk[0].name];
						else if (pk.length > 1) {
							schema[normalizedTableName].primaryKey = [];

							_.each(pk, function (value) {
								schema[normalizedTableName].primaryKey.push(value.name);
							});
						}
					}, reject);
				});

				RSVP.all(tableFetchers).then(function(){
					return resolve(schema);
				}, reject);
			}, reject);
		});
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
					from: model._tableName,
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
			validateFields(model, data);

			var dataKeys = _.keys(data),
				columns = {},
				query = 'INSERT INTO '+model._tableName;

			_.each(dataKeys, function (key) {
				if (_.has(model.fields, key))
					columns[model.fields[key]._columnName] = mysql.escape(data[key]);
			});

			query+= '(' + _.keys(columns).join(',') + ') VALUES(' + _.values(columns).join(',') + ')';

			self._db.query(query).then(function (result) {
				var conditions = [];

				_.each(model.primaryKey, function (value) {
					if (value == 'id' && data[value] === null) {
						conditions.push(new self.where.isEqual(value, result.insertId));
					}
					else
						conditions.push(new self.where.isEqual(value, data[value]));
				});

				self.find(model, {limit: 1}, conditions).then(function (newData) {
					return resolve(newData[0]);
				}, reject);
			}, reject);

			function validateFields(model, obj) {
				for (var key in model.fields) {
					if (model.fields[key].required) {
						if ( ! _.has(obj, key))
							throw new utils.Exceptions.ValidationException('Object missing required fields!');
					}
				}
			}
		});
	},

	save: function (model, data) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			var dataKeys = _.keys(data),
				columns = [],
				query = 'UPDATE '+model._tableName+' SET ',
				conditions = [];

			// Build the where
			_.each(model.primaryKey, function (value) {
				conditions.push(new self.where.isEqual(value, data[value]));
			});

			_.each(dataKeys, function (key) {
				if (_.has(model.fields, key))
					columns.push(model.fields[key]._columnName+'='+mysql.escape(data[key]));
			});

			query+= columns.join(',')+' '+parseWhereToQueryString(conditions);
				
			self._db.query(query).then(function (result) {
				self.find(model, {limit: 1}, conditions).then(function (newData) {
					return resolve(newData[0]);
				}, reject);
			}, reject);
		});
	},

	delete: function (model, data) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			var query = "DELETE FROM "+model._tableName,
				conditions = [];

			// Build the where
			_.each(model.primaryKey, function (value) {
				conditions.push(new self.where.isEqual(value, data[value]));
			});

			query+= ' '+parseWhereToQueryString(conditions)+' LIMIT 1';

			self._db.query(query).then(function (result) {
				resolve(result);
			}, reject);
		});
	},

	reload: function (model, data) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			var conditions = [];

			// Build the where
			_.each(model.primaryKey, function (value) {
				conditions.push(new self.where.isEqual(value, data[value]));
			});
			
			self.find(model, {limit: 1}, conditions).then(function (newData) {
				return resolve(newData[0]);
			}, reject);
		});
	}
});

// Export the class
module.exports = MySQL;


/**
 *       PRIVATE FUNCTIONS
 */

function primaryKeyToQuery(primaryKey) {
	var pks = [];

	if (_.isArray(primaryKey)) {
		_.each(primaryKey, function (pk) {
			pks.push(pk.field+'="'+pk.value+'"');
		});
	}
	else
		pks.push(primaryKey.field+'="'+primaryKey.value+'"');

	return pks.join(' AND ');
}

function normalizeData(data) {
	var normalizedData = [];

	data.forEach(function (row) {
		var newData = {};

		_.each(row, function (value, key) {
			newData[normalizeName(key)] = value;
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

	if (query.limit)
		queryPush('LIMIT '+query.limit);

	if (query.offset)
		queryPush('OFFSET '+query.offset);

	if (query.orderBy) {
		queryPush('ORDER BY '+query.orderBy);
		if (query.direction)
			queryPush(normalizeDirection(query.direction));
	}

	return queryArray.join(' ');

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

function parseColumns (tableData) {
	var schema = {};

	_.each(tableData, function (value, index) {
		var field = {
			name: normalizeName(value.Field),
			_columnName: value.Field,
			primaryKey: value.Key == 'PRI',
			type: parseType(value.Type),
			required: value.Null == 'NO' && value.Extra !== 'auto_increment',
			options: parseOptions(value.Comment),
			validation: []
		};

		schema[field.name] = field;
	});

	return schema;
}

// TODO: Flesh this out
function parseType(type) {
	return type;
}

function parseOptions(comment) {
	if (comment.length === 0) return [];

	return comment.split(',');
}

function normalizeName(name) {
	var parts = name.split('_');

	for (var i = 1, l = parts.length; i < l; i++) {
		parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
	}

	return parts.join('');
}