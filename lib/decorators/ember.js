var _ = require('underscore');

var EmberDecorator = {
	unknownProperty: function (key) {
		return this.get(key);
	},

	setUnknownProperty: function (key, value) {
		Ember.propertyWillChange(this, key);

		this.set(key, value);

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