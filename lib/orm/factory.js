var utils = require('./../utils'),
	RSVP = require('rsvp'),
	_ = require('underscore'),
	Where = require('./where');

var Factory = utils.Class.extend({
	_model: null,
	_modelName: null,
	_modelSchema: null,
	_repository: null,
	_logger: null,
	_conditions: null,
	_findOptions: null,
	_orm: null,

	init: function (orm, modelName) {
		utils.assert('`orm` is a required field!', orm !== undefined);
		utils.assert('`modelName` is a required field!', modelName !== undefined);

		this._model = orm._models[modelName];
		this._modelName = modelName;
		this._modelSchema = orm._getModelSchema(this._modelName);
		this._repository = orm._repository;
		this._logger = orm._logger;
		this._orm = orm;
		this._conditions = [];
		this._findOptions = {};
	},

	where: function (field) {
		return new Where(this, field);
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
					self.where(self._modelSchema.primaryKey[0]).isEqual(id);
				}
			}

			self.limit(1);

			self._repository.find(self._modelSchema, self._findOptions, self._conditions).then(function (result) {
				var model = new self._model(result[0]);

				model._isNew = false;

				return resolve(model);
			}, reject);
		});
	},

	findAll: function () {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			var query = self._repository.find(self._orm._getModelSchema(self._modelName), self._findOptions, self._conditions);

			query.then(function (result) {
				var items = [];

				_.each(result, function (data) {
					try {
						var newModel = new self._model(data);

						newModel._isNew = false;
						
						items.push(newModel);
					}
					catch (err) {
						reject(err);
					}
				});

				return resolve(items);
			}, reject);
		});
	},

	getClass: function () {
		return this._model;
	}
});

module.exports = Factory;