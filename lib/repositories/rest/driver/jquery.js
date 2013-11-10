// Get dependencies
var RSVP = require('rsvp'),
	_ = require('underscore'),
	utils = require('./../../../utils'),
	Response = require('./response');

/**
 * Requires jQuery
 */
var RestJqueryDriver = utils.Class.extend({
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
			jQuery.ajax({
				url: self.baseUrl+url,
				type: 'GET',
				headers: headers,
			}).then(function (data, status, xhr) {
				resolve(new Response(data, xhr.status, this.logger));
			}, function (xhr, status, error) {
				reject(error);
			});
		});
	},

	post: function (url, body, headers) {
		var self = this;
		headers = headers || {};
		
		return new RSVP.Promise(function (resolve, reject) {
			jQuery.ajax({
				url: self.baseUrl+url,
				type: 'POST',
				headers: headers,
				data: body,
			}).then(function (data, status, xhr) {
				resolve(new Response(data, xhr.status, this.logger));
			}, function (xhr, status, error) {
				reject(error);
			});
		});
	},

	put: function (url, body, headers) {
		var self = this;
		headers = headers || {};
		
		return new RSVP.Promise(function (resolve, reject) {
			jQuery.ajax({
				url: self.baseUrl+url,
				type: 'PUT',
				headers: headers,
				data: body,
			}).then(function (data, status, xhr) {
				resolve(new Response(data, xhr.status, this.logger));
			}, function (xhr, status, error) {
				reject(error);
			});
		});
	},

	delete: function (url, headers) {
		var self = this;
		headers = headers || {};
		
		return new RSVP.Promise(function (resolve, reject) {
			jQuery.ajax({
				url: self.baseUrl+url,
				type: 'DELETE',
				headers: headers
			}).then(function (data, status, xhr) {
				resolve(new Response(data, xhr.status, this.logger));
			}, function (xhr, status, error) {
				reject(error);
			});
		});
	},
});

module.exports = RestJqueryDriver;