var utils = require('./../../utils');

var AbstractCondition = utils.Class.extend({
	field: null,
	value: null,

	init: function (field, value) {
		this.field = field;
		this.value = value;

		throw new utils.Exceptions.AbstractClassException();
	}
});

module.exports = {

	isEqual: AbstractCondition.extend(),

	isNotEqual: AbstractCondition.extend(),

	isBetween: AbstractCondition.extend(),

	isGreaterThan: AbstractCondition.extend(),

	isGreaterThanOrEqual: AbstractCondition.extend(),

	isLessThan: AbstractCondition.extend(),

	isLessThanOrEqual: AbstractCondition.extend(),

	isNull: AbstractCondition.extend(),

	isNotNull: AbstractCondition.extend()
};