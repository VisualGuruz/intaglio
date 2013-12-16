var BaseModel = require('./../../../lib/orm/basemodel'),
    utils = require('./../../../lib/utils'),
    should = require('chai').should(),
    expect = require('chai').expect;

describe('BaseModel Object Tests', function () {
	var mockClass = BaseModel.extend({
		init: function (mocks) {
			this._model = mocks.model;
			this._repository = mocks.repository;
			this._logger = mocks.logger;
			this._wrapper = mocks.wrapper;

			this._setup(5, mocks.data);
		}
	});

    it('Should not let you instantiate it', function () {
        var test = function () {
			(function (model) {/* NOOP */})(new BaseModel());
        };

        test.should.throw(utils.Exceptions.AbstractClassException);
    });
});