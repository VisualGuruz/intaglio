var _ = require('underscore'),
	RSVP = require('rsvp'),
	exceptions = require('./../../utils/exceptions');

// Set up the API object for return
var api = {};

// Setup the globals
var globalOptions, db, logger;

module.exports = function  (opts, loggerModule, driverModule) {
	globalOptions = opts;

	logger = loggerModule || console;

	db = driverModule || require('./driver');

	db = db(opts.connection, logger);

	// Return the public API
	return api;
};

api.getSchema = function () {
	return new RSVP.Promise(function (resolve, reject) {
		db.query('SHOW TABLES').then(function (result) {
			var schema = {},
				tableFetchers = [];

			_.each(result, function(value, key) {
				var tblName = _.values(value)[0],
					fetcher = db.query('SHOW FULL COLUMNS FROM '+tblName),
					normalizedTableName = normalizeName(tblName);

				schema[normalizedTableName] = {
					name: normalizedTableName,
					_tableName: tblName,
					primaryKey: null
				};

				tableFetchers.push(fetcher);

				fetcher.then(function (tblData) {
					var pk = _.where(tblData, {primaryKey: true});

					if (pk.length === 1)
						schema.primaryKey = pk[0];
					else if (pk.length > 1)
						schema.primaryKey = pk;

					schema[normalizedTableName].fields = parseColumns(tblData);
				}, reject);
			});

			RSVP.all(tableFetchers).then(function(){
				return resolve(schema);
			}, reject);
		}, reject);
	});
};

api.find = function (model, options, conditions) {
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

		db.query(query).then(function (result) {
			resolve(normalizeData(result));
		}, reject);
	});
};

api.create = function (model, data) {
	return new RSVP.Promise(function (resolve, reject) {
		validateFields(model, data);

		var dataKeys = _.keys(data),
			columns = {},
			query = 'INSERT INTO '+model._tableName;

		_.each(dataKeys, function (key) {
			if (_.has(model.fields, key))
				columns[key] = "'" + data[key] + "'";
		});

		query+= '(' + _.keys(columns).join(',') + ') VALUES(' + _.values(columns).join(',') + ')';

		db.query(query).then(function (result) {
			return resolve(result);
		}, reject);

		function validateFields(model, obj) {
			for (var key in model.fields) {
				if (model.fields[key].required) {
					if ( ! _.has(obj, key))
						throw new exceptions.ValidationException('Object missing required fields!');
				}
			}
		}
	});
};

api.save = function (model, data, primaryKey) {
	return new RSVP.Promise(function (resolve, reject) {
		var dataKeys = _.keys(data),
			columns = [],
			query = 'UPDATE '+model._tableName+' SET ';

		_.each(dataKeys, function (key) {
			if (_.has(model.fields, key))
				columns.push(key+'="'+data[key]+'"');
		});

		query+= columns.join(',')+' WHERE '+primaryKeyToQuery(primaryKey);
			
		db.query(query).then(function (result) {
			resolve(result);
		}, reject);
	});
};

api.delete = function (model, primaryKey) {
	return new RSVP.Promise(function (resolve, reject) {
		var query = "DELETE FROM "+model._tableName+' WHERE '+primaryKeyToQuery(primaryKey);

		db.query(query).then(function (result) {
			resolve(result);
		}, reject);
	});
};

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
	return data;
}

function buildSelectQuery(queryObj) {
	var baseQuery = {
			what: null,
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

function parseWhereToQueryString (whereObj) {
	return '';
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