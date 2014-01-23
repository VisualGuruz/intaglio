// Get dependencies
var RSVP = require('rsvp'),
	_ = require('underscore'),
	utils = require('./../../../utils');

var MySQLDriver = utils.Class.extend({
	pool: null,
	logger: null,
	_schema: null,
	_data: null,

	init: function (schema, data) {
		this._schema = schema;
		this._data = data;
	},

	query: function (query) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			if (self.responses[query] === undefined)
				return reject(new Error("Query not mocked! Query: "+query));

			return resolve(self.responses[query].apply(self));
		});
	},

	responses: {
		'SHOW TABLES': function (){
			var ret = [];

			_.each(this._schema, function (table) {
				ret.push({name: table.name});
			});

			return ret;
		},

		'SHOW FULL COLUMNS FROM people': function () {
			var ret = [];

			_.each(this._schema.people.properties, function (prop) {
				ret.push({
					'Field': prop.name,
					'Type': prop.type,
					'Comment': '',
					'Key': prop.primaryKey ? 'PRI' : null,
					'Null': prop.required ? 'NO' : 'YES',
					'Extra': prop.autoIncrement ? 'auto_increment' : null
				});
			});
			return ret;
		},

		'SHOW FULL COLUMNS FROM photos': function () {
			var ret = [];

			_.each(this._schema.photos.properties, function (prop) {
				ret.push({
					'Field': prop.name,
					'Type': prop.type,
					'Comment': '',
					'Key': prop.primaryKey ? 'PRI' : null,
					'Null': prop.required ? 'NO' : 'YES',
					'Extra': prop.autoIncrement ? 'auto_increment' : null
				});
			});
			return ret;
		},

		'SELECT people.* FROM people;': function () {
			return this._data.people;
		},

		'SELECT photos.* FROM photos WHERE `person_id` = 1;': function () {
			return _.filter(this._data.photos, function (d) {
				return d.person_id === 1;
			});
		},

		'SELECT photos.* FROM photos WHERE `person_id` <> 1;': function () {
			return _.filter(this._data.photos, function (d) {
				return d.person_id !== 1;
			});
		},

		'SELECT photos.* FROM photos WHERE `id` BETWEEN 10 AND 20;': function () {
			return _.filter(this._data.photos, function (d) {
				return (d.id >= 10 && d.id <= 20);
			});
		},

		'SELECT photos.* FROM photos WHERE `id` > 50;': function () {
			return _.filter(this._data.photos, function (d) {
				return (d.id > 50);
			});
		},

		'SELECT photos.* FROM photos WHERE `id` >= 50;': function () {
			return _.filter(this._data.photos, function (d) {
				return (d.id >= 50);
			});
		},

		'SELECT photos.* FROM photos WHERE `id` < 50;': function () {
			return _.filter(this._data.photos, function (d) {
				return (d.id < 50);
			});
		},

		'SELECT photos.* FROM photos WHERE `id` <= 50;': function () {
			return _.filter(this._data.photos, function (d) {
				return (d.id <= 50);
			});
		},

		'SELECT people.* FROM people WHERE `email` IS NULL;': function () {
			return _.filter(this._data.people, function (d) {
				return (d.email === null);
			});
		},

		'SELECT people.* FROM people WHERE `email` IS NOT NULL;': function () {
			return _.filter(this._data.people, function (d) {
				return (d.email !== null);
			});
		},

		'SELECT people.* FROM people WHERE `email` IS NOT NULL AND `id` BETWEEN 1 AND 10;': function () {
			return _.filter(this._data.people, function (d) {
				return (d.email !== null && d.id >= 1 && d.id <= 10);
			});
		},

		'SELECT people.* FROM people WHERE `email` IS NOT NULL ORDER BY lastName;': function () {
			var data = _.filter(this._data.people, function (d) {
				return (d.email !== null);
			});

			return orderBy(data, 'last_name');
		},

		'SELECT people.* FROM people WHERE `email` IS NOT NULL ORDER BY lastName DESC;': function () {
			var data = _.filter(this._data.people, function (d) {
				return (d.email !== null);
			});

			return orderBy(data, 'last_name', true);
		},

		'SELECT people.* FROM people WHERE `email` IS NOT NULL ORDER BY lastName DESC LIMIT 5;': function () {
			var data = _.filter(this._data.people, function (d) {
				return (d.email !== null);
			});

			return limit(orderBy(data, 'last_name', true), 5);
		},

		'SELECT people.* FROM people WHERE `email` IS NOT NULL ORDER BY lastName DESC LIMIT 5 OFFSET 10;': function () {
			var data = _.filter(this._data.people, function (d) {
				return (d.email !== null);
			});

			return limit(offset(orderBy(data, 'last_name', true), 10), 5);
		},

		"INSERT INTO people(`first_name`,`last_name`,`email`) VALUES('Ricky','Bobby','shakenbake@example.com')": function () {
			var max = _.max(this._data.people, function (p) {
				return p.id;
			}).id + 1;

			this._data.people.push({
				'id': max,
				'first_name': 'Ricky',
				'last_name': 'Bobby',
				'email': 'shakenbake@example.com'
			});

			return {
				insertId: max
			};
		},

		"SELECT people.* FROM people WHERE `id` = 21 LIMIT 1;": function () {
			return _.filter(this._data.people, function (d) {
				return d.id === 21;
			});
		},

		"SELECT people.* FROM people WHERE `id` = 1;": function () {
			return _.filter(this._data.people, function (d) {
				return d.id === 1;
			});
		},

		"UPDATE people SET `id`=1,`first_name`='Kirestin',`last_name`='Villarreal',`email`='newguy@example.com' WHERE `id` = 1": function () {
			var person = _.where(this._data.people, {'id': 1});

			person[0].email = 'newguy@example.com';
		},

		"SELECT people.* FROM people WHERE `id` = 1 LIMIT 1;": function () {
			return limit(_.filter(this._data.people, function (d) {
				return d.id === 1;
			}), 1);
		},

		"DELETE FROM people WHERE `id` = 1 LIMIT 1": function () {
			var person = _.where(this._data.people, {'id': 1})[0];

			this._data.people.splice(_.indexOf(this._data.people, person), 1);
		}
	}
});

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

module.exports = MySQLDriver;