var utils = require('./../utils'),
	RSVP = require('rsvp');

var Factory = utils.Class.extend({
	_model: null,
	_modelName: null,
	_repository: null,
	_logger: null,
	_conditions: null,
	_findOptions: {},
	_orm: null,

	init: function (orm, modelName) {
		utils.assert('`orm` is a required field!', orm !== undefined);
		utils.assert('`modelName` is a required field!', modelName !== undefined);

		this._model = orm._models[modelName];
		this._modelName = modelName;
		this._repository = orm._repository;
		this._logger = orm._logger;
		this._orm = orm;
	},

	where: function (field) {
		return this;
	},

	limit: function (number) {
		this._findOptions.limit = number;

		return this;
	},

	offset: function (number) {
		this._findOptions.offset = number;

		return this;
	},

	orderBy: function (field, direction) {
		direction = direction || 'ascending';

		this._findOptions.orderBy = field;
		this._findOptions.direction = direction;

		return this;
	},

	create: function (data) {
		return new this._model(data);
	},

	find: function (id) {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			if (id !== undefined) {
				if (_.isObject(id)) {
					_.each(id, function (value, key) {
						self.where(key).equals(value);
					});
				}

				else {
					self.where(self._model.primaryKey[0]).equals(id);
				}
			}

			self.limit(1);
		});
	},

	findAll: function () {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			var query = self._repository.find(self._orm.getModelSchema(self._modelName), self._findOptions, self._conditions);

			query.then(function (result) {
				var items = []
				_.each(result, function (data) {
					items.push(new self._model(data));
				});

				resolve(items);
			}, reject)
		});
	},

	getClass: function () {
		return this._model;
	}
});