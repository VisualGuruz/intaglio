var RSVP = require('rsvp'),
	utils = require('./../utils'),
	AbstractWrapper = require('./abstract');

var VanillaWrapper = AbstractWrapper.extend({
	init: function (object) {
		this._object = object;
	}
});

module.exports = VanillaWrapper;