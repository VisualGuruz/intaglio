var AbstractWhere = require('./../abstract/where'),
	utils = require('./../../utils'),
	_ = require('underscore');

var classes = {};

classes.isEqual = AbstractWhere.isEqual.extend({
	init: function (field, value) {
		this.field = field;
		this.value = value;
	},

	filter: function (data) {
		var self = this;

		return _.filter(data, function (d) {
			return d[self.field] === self.value;
		});
	}
});

classes.isNotEqual = AbstractWhere.isNotEqual.extend({
	init: function (field, value) {
		this.field = field;
		this.value = value;
	},

	filter: function (model) {
		var self = this;

		return _.reject(data, function (d) {
			return d[self.field] === self.value;
		});
	}
});

classes.isBetween = AbstractWhere.isBetween.extend({
	init: function (field, value) {
		this.field = field;
		this.value = value;

		utils.assert('Value must be an array with only two items', _.isArray(value) && value.length === 2);
	},

	filter: function (model) {
		var self = this;

		return _.filter(data, function (d) {
			return d[self.field] >= self.value[0] && d[self.field] <= self.value[1];
		});
	}
});

classes.isGreaterThan = AbstractWhere.isGreaterThan.extend({
	init: function (field, value) {
		this.field = field;
		this.value = value;
	},

	filter: function (model) {
		var self = this;

		return _.filter(data, function (d) {
			return d[self.field] > self.value;
		});
	}
});

classes.isGreaterThanOrEqual = AbstractWhere.isGreaterThanOrEqual.extend({
	init: function (field, value) {
		this.field = field;
		this.value = value;
	},

	filter: function (model) {
		var self = this;

		return _.filter(data, function (d) {
			return d[self.field] >= self.value;
		});
	}
});

classes.isLessThan = AbstractWhere.isLessThan.extend({
	init: function (field, value) {
		this.field = field;
		this.value = value;
	},

	filter: function (model) {
		var self = this;

		return _.filter(data, function (d) {
			return d[self.field] < self.value;
		});
	}
});

classes.isLessThanOrEqual = AbstractWhere.isLessThanOrEqual.extend({
	init: function (field, value) {
		this.field = field;
		this.value = value;
	},

	filter: function (model) {
		var self = this;

		return _.filter(data, function (d) {
			return d[self.field] <= self.value;
		});
	}
});

classes.isNull = AbstractWhere.isNull.extend({
	init: function (field) {
		this.field = field;
	},

	filter: function (model) {
		var self = this;

		return _.filter(data, function (d) {
			return d[self.field] === null;
		});
	}
});

classes.isNotNull = AbstractWhere.isNotNull.extend({
	init: function (field) {
		this.field = field;
	},

	filter: function (model) {
		var self = this;

		return _.filter(data, function (d) {
			return d[self.field] !== null;
		});
	}
});

module.exports = classes;