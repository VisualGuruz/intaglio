var utils = require('./../utils'),
	RSVP = require('rsvp');

var Factory = utils.Class.extend({
	_model: null,
	_repository: null,
	_logger: null,

	init: function (modelClass, repository, loggerModule) {
		utils.assert('`modelClass` is a required field!', modelClass !== undefined);
		utils.assert('`repository` is a required field!', repository !== undefined);
		utils.assert('`loggerModule` is a required field!', loggerModule !== undefined);

		this._model = modelClass;
		this._repository = repository;
		this._logger = loggerModule;
	},

	where: function (field) {},

	limit: function (number) {},

	offset: function (number) {},

	orderBy: function (field, direction) {},

	create: function (data) {},

	find: function (id) {
		return new RSVP.Promise(function (resolve, reject) {
			
		});
	},

	findAll: function () {
		return new RSVP.Promise(function (resolve, reject) {

		});
	}
});