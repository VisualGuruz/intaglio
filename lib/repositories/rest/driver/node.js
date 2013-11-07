// Get dependencies
var mysql = require('mysql'),
	RSVP = require('rsvp'),
	_ = require('underscore'),
	utils = require('./../../../utils'),
	request = require('request'),
	Response = require('./response');

var RestNodeDriver = utils.Class.extend({
	logger: null,
	baseUrl: null,

	init: function (options, loggerModule) {
		// Validate the input
		utils.assert('`options` must be an object!', _.isObject(options));
		utils.assert('Options must have a baseUrl string!', _.isString(options.baseUrl));

		this.baseUrl = options.baseUrl;

		// Bring in the logger
		this.logger = loggerModule || console;
	},

	get: function (url, headers) {
		var self = this;
		headers = headers || {};
		
		return new RSVP.Promise(function (resolve, reject) {
			request({
				url: self.baseUrl+url,
				headers: headers,
				method: 'GET'
			}, function (err, response, body) {
				if (err)
					reject(err);

				resolve(new Response(JSON.parse(body), response.statusCode, this.logger));
			});
		});
	},

	post: function (url, body, headers) {
		var self = this;
		headers = headers || {};
		
		return new RSVP.Promise(function (resolve, reject) {
			request({
				url: self.baseUrl+url,
				headers: headers,
				method: 'POST',
				json: body,
			}, function (err, response, body) {
				if (err)
					reject(err);

				resolve(new Response(body, response.statusCode, this.logger));
			});
		});
	},

	put: function (url, body, headers) {
		var self = this;
		headers = headers || {};
		
		return new RSVP.Promise(function (resolve, reject) {
			request({
				url: self.baseUrl+url,
				headers: headers,
				method: 'PUT',
				json: body,
			}, function (err, response, body) {
				if (err)
					reject(err);

				resolve(new Response(body, response.statusCode, this.logger));
			});
		});
	},

	delete: function (url, headers) {
		var self = this;
		headers = headers || {};
		
		return new RSVP.Promise(function (resolve, reject) {
			request({
				url: self.baseUrl+url,
				headers: headers,
				method: 'DELETE'
			}, function (err, response, body) {
				if (err)
					reject(err);

				resolve(new Response(body, response.statusCode, this.logger));
			});
		});
	},
});

module.exports = RestNodeDriver;