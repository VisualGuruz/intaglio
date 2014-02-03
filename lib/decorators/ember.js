var _ = require('underscore');

var EmberDecorator = {
	unknownProperty: function (key) {
		return this.get(key);
	},

	get: function (key) {
		var prop = this.getSchema().getProperty(key);

		if (prop !== undefined)
			return this._super(key);

		if (this[key] !== undefined)
			return this[key];
	},

	setUnknownProperty: function (key, value) {
		return this.set(key, value);
	},

	set: function (key, value) {
		var self = this;

		// If key is an object, we're trying to set multiple props
		if (_.isObject(key)) {
			_.each(key, function (val, name) {
				self.set(name, val);
			});
			return this;
		}

		var prop = this.getSchema().getProperty(key);

		Ember.propertyWillChange(this, key);

		if (prop !== undefined)
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