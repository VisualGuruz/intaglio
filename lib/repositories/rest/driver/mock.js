// Get dependencies
var RSVP = require('rsvp'),
	_ = require('underscore'),
	utils = require('./../../../utils'),
	request = require('request'),
	Response = require('./response');

var RestMockDriver = utils.Class.extend({
	_schema: null,
	_data: null,

	init: function (schema, data) {
		this._schema = schema;
		this._data = data;
	},

	get: function (url, headers) {
		return this.request('GET', url);
	},

	post: function (url, body, headers) {
		return this.request('POST', url, body);
	},

	put: function (url, body, headers) {
		return this.request('PUT', url, body);
	},

	delete: function (url, headers) {
		return this.request('DELETE', url);
	},

	request: function request (method, uri, body) {
		var key = method+' '+uri,
			self = this;

		return new RSVP.Promise(function (resolve, reject) {
			if (self._responses[key] === undefined)
				throw new Error("Request not mocked! "+key);

			try {
				return resolve(self._responses[key].call(self, body));
			}
			catch (err) {
				reject(err);
			}
		});
	},

	_responses: {
		"GET /schema": function () {
			return new Response(this._schema, 200);
		},

		"GET /api/people": function () {
			return new Response({
				_embedded: {
					people: this._data.people
				}
			}, 200);
		},

		"GET /api/photos?person_id=1": function () {
			var data = _.filter(this._data.photos, function (d) {
				return d.person_id === 1;
			});

			return new Response({
				_embedded: {
					photos: data
				}
			}, 200);
		},

		"GET /api/photos?person_id=<>1": function () {
			var data = _.filter(this._data.photos, function (d) {
				return d.person_id !== 1;
			});

			return new Response({
				_embedded: {
					photos: data
				}
			}, 200);
		},

		"GET /api/photos?id=10|20": function () {
			var data = _.filter(this._data.photos, function (d) {
				return (d.id >= 10 && d.id <= 20);
			});

			return new Response({
				_embedded: {
					photos: data
				}
			}, 200);
		},

		"GET /api/photos?id=>50": function () {
			var data = _.filter(this._data.photos, function (d) {
				return (d.id > 50);
			});

			return new Response({
				_embedded: {
					photos: data
				}
			}, 200);
		},

		"GET /api/photos?id=>=50": function () {
			var data = _.filter(this._data.photos, function (d) {
				return (d.id >= 50);
			});

			return new Response({
				_embedded: {
					photos: data
				}
			}, 200);
		},

		"GET /api/photos?id=<50": function () {
			var data = _.filter(this._data.photos, function (d) {
				return (d.id < 50);
			});

			return new Response({
				_embedded: {
					photos: data
				}
			}, 200);
		},

		"GET /api/photos?id=<=50": function () {
			var data = _.filter(this._data.photos, function (d) {
				return (d.id <= 50);
			});

			return new Response({
				_embedded: {
					photos: data
				}
			}, 200);
		},

		"GET /api/people?email=:NULL:": function () {
			var data = _.filter(this._data.people, function (d) {
				return (d.email === null);
			});

			return new Response({
				_embedded: {
					people: data
				}
			}, 200);
		},

		"GET /api/people?email=<>:NULL:": function () {
			var data = _.filter(this._data.people, function (d) {
				return (d.email !== null);
			});

			return new Response({
				_embedded: {
					people: data
				}
			}, 200);
		},

		"GET /api/people?email=<>:NULL:&id=1|10": function () {
			var data = _.filter(this._data.people, function (d) {
				return (d.email !== null && d.id >= 1 && d.id <= 10);
			});

			return new Response({
				_embedded: {
					people: data
				}
			}, 200);
		},

		"GET /api/people?email=<>:NULL:&_order=lastName": function () {
			var data = _.filter(this._data.people, function (d) {
				return (d.email !== null);
			});

			return new Response({
				_embedded: {
					people: orderBy(data, 'last_name')
				}
			}, 200);
		},

		"GET /api/people?email=<>:NULL:&_order=lastName:descending": function () {
			var data = _.filter(this._data.people, function (d) {
				return (d.email !== null);
			});

			return new Response({
				_embedded: {
					people: orderBy(data, 'last_name', true)
				}
			}, 200);
		},

		"GET /api/people?email=<>:NULL:&_order=lastName:descending&_limit=5": function () {
			var data = _.filter(this._data.people, function (d) {
				return (d.email !== null);
			});

			return new Response({
				_embedded: {
					people: limit(orderBy(data, 'last_name', true), 5)
				}
			}, 200);
		},

		"GET /api/people?email=<>:NULL:&_order=lastName:descending&_limit=5&_offset=10": function () {
			var data = _.filter(this._data.people, function (d) {
				return (d.email !== null);
			});

			return new Response({
				_embedded: {
					people: limit(offset(orderBy(data, 'last_name', true), 10), 5)
				}
			}, 200);
		},

		"POST /api/people": function (body) {
			var max = _.max(this._data.people, function (p) {
					return p.id;
				}).id + 1,
				data = {
					'id': max,
					'first_name': body.first_name,
					'last_name': body.last_name,
					'email': body.email
				};

			this._data.people.push(data);

			return new Response(data, 200);
		},

		"GET /api/people/21": function () {
			var data =_.filter(this._data.people, function (d) {
				return d.id === 21;
			});

			return new Response(data[0], 200);
		},

		"GET /api/people/1": function () {
			var data =_.filter(this._data.people, function (d) {
				return d.id === 1;
			});

			if (data[0] !== undefined)
				return new Response(data[0], 200);

			return new Response(null, 404);
		},

		"PUT /api/people/1": function (body) {
			var person = _.where(this._data.people, {'id': 1});

			_.extend(person[0], body);

			return new Response(person[0], 200);
		},

		"DELETE /api/people/1": function () {
			var person = _.where(this._data.people, {'id': 1})[0];

			this._data.people.splice(_.indexOf(this._data.people, person), 1);

			return new Response(null, 204);
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


module.exports = RestMockDriver;


