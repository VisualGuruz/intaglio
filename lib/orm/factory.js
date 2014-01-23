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
		this._modelSchema = orm.getSchema().getModel(modelName);
		this._repository = orm._repository;
		this._logger = orm._logger;
		this._orm = orm;
		this._conditions = [];
		this._findOptions = {};
	},

	where: function (field) {
		return new Where(this, this._modelSchema.getProperty(field));
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

		this._findOptions.orderBy = this._modelSchema.getProperty(field).getOriginalName();
		this._findOptions.direction = direction;

		return this;
	},

	create: function (data) {
		return utils.instantiateModel(this._orm, this._model, data);
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
					self.where(self._modelSchema.getPrimaryKey()[0]).isEqual(id);
				}
			}

			self.limit(1);

			self._repository.find(self._modelSchema, self._findOptions, self._conditions).then(function (result) {
				if (result.length === 0)
					return resolve(null);

				var model = utils.instantiateModel(self._orm, self._model, self._modelSchema.translateObjectToOrm(result[0]), false);

				model._isNew = false;

				return resolve(model);
			}, reject);
		});
	},

	findAll: function () {
		var self = this;

		return new RSVP.Promise(function (resolve, reject) {
			var query = self._repository.find(self._modelSchema, self._findOptions, self._conditions);

			query.then(function (result) {
				var items = [];

				_.each(result, function (data) {
					try {
						var model = utils.instantiateModel(self._orm, self._model, self._modelSchema.translateObjectToOrm(data), false);

						model._isNew = false;
						
						items.push(model);
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