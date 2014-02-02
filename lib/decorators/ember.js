var _ = require('underscore');

var EmberDecorator = {
	unknownProperty: function (key) {
		return this.get(key);
	},

	get: function (key) {
		var ret = this._super(key);

		if (ret !== undefined)
			return ret;

		if (this[key] !== undefined)
			return this[key];
	},

	setUnknownProperty: function (key, value) {
		return this.set(key, value);
	},

	set: function (key, value) {
		var ret = this.get(key);

		Ember.propertyWillChange(this, key);

		if (ret !== undefined)
			this._super(key, value);

		if (this[key] !== undefined)
			this[key] = value;

		Ember.propertyDidChange(this, key);

		return this;
	},

	reload: function () {
		// Get a list of the changed values
		var currentData = this.getData(),
			self = this;

		return this._super().then(function (obj) {
			var newData = obj.getData(),
				changedFields = [];

			_.each(newData, function (value, key) {
				if (currentData[key] !== value)
					changedFields.push(key);
			});

			_.each(changedFields, function (key) {
				Ember.propertyWillChange(self, key);
				Ember.propertyDidChange(self, key);
			});
		});
	}
};

module.exports = EmberDecorator;