var AbstractWhere = require('./../abstract/where'),
	utils = require('./../../utils'),
	_ = require('underscore');

var classes = {};

classes.isEqual = AbstractWhere.isEqual.extend({
	init: function (field, value) {
		this.field = field;
		this.value = value;
	},

	toQuery: function () {
		return this.field+'='+this.value;
	}
});

classes.isNotEqual = AbstractWhere.isNotEqual.extend({
	init: function (field, value) {
		this.field = field;
		this.value = value;
	},

	toQuery: function () {
		return this.field+'=<>'+this.value;
	}
});

classes.isBetween = AbstractWhere.isBetween.extend({
	init: function (field, value) {
		this.field = field;
		this.value = value;

		utils.assert('Value must be an array with only two items', _.isArray(value) && value.length === 2);
	},

	toQuery: function () {
		return this.field+'='+this.value[0]+'|'+this.value[1];
	}
});

classes.isGreaterThan = AbstractWhere.isGreaterThan.extend({
	init: function (field, value) {
		this.field = field;
		this.value = value;
	},

	toQuery: function () {
		return this.field+'=>'+this.value;
	}
});

classes.isGreaterThanOrEqual = AbstractWhere.isGreaterThanOrEqual.extend({
	init: function (field, value) {
		this.field = field;
		this.value = value;
	},

	toQuery: function () {
		return this.field+'=>='+this.value;
	}
});

classes.isLessThan = AbstractWhere.isLessThan.extend({
	init: function (field, value) {
		this.field = field;
		this.value = value;
	},

	toQuery: function () {
		return this.field+'=<'+this.value;
	}
});

classes.isLessThanOrEqual = AbstractWhere.isLessThanOrEqual.extend({
	init: function (field, value) {
		this.field = field;
		this.value = value;
	},

	toQuery: function () {
		return this.field+'=<='+this.value;
	}
});

classes.isNull = AbstractWhere.isNull.extend({
	init: function (field) {
		this.field = field;
	},

	toQuery: function () {
		return this.field+'=:NULL:';
	}
});

classes.isNotNull = AbstractWhere.isNotNull.extend({
	init: function (field) {
		this.field = field;
	},

	toQuery: function () {
		return this.field+'=<>:NULL:';
	}
});

module.exports = classes;