var utils = require('./../../../lib/utils'),
	Schema = require('./../../../lib/schema'),
	chai = require('chai'),
	should = chai.should(),
	expect = chai.expect,
	chaiAsPromised = require("chai-as-promised"),
	_ = require('underscore'),
	MockRepository = require('./../../../lib/repositories/mock'),
	data = require('./../../mock-data/data.json'),
	schema = require('./../../mock-data/schema.json'),
	ORM = require('./../../../lib/orm');

chai.use(chaiAsPromised);

describe('CRUD Operations', function () {
	var repo, orm;

	beforeEach(function (done) {
		var newData = JSON.parse(JSON.stringify(data)),
			newSchema = JSON.parse(JSON.stringify(schema));

		repo = new MockRepository(newSchema, newData);

		ORM.create(repo).then(function (newOrm) {
			orm = newOrm;
			done();
		}, done);
	});

	describe('Read', function () {
		it('Should get the first model from the repository', function () {
			return orm.factory('person').find().then(function (person) {
				expect(person).to.exist;
				expect(person).to.be.an.instanceOf(orm.getClass('person'));
				expect(person.get('id')).to.equal(1);
			});
		});

		it('Should get a specific model from the repository by passing the pk into find()', function () {
			return orm.factory('person').find(7).then(function (person) {
				expect(person).to.exist;
				expect(person).to.be.an.instanceOf(orm.getClass('person'));
				expect(person.get('id')).to.equal(7);
			});
		});

		it('Should get a specific model from the repository by passing an object of KVPs into find()', function () {
			return orm.factory('person').find({id: 7}).then(function (person) {
				expect(person).to.exist;
				expect(person).to.be.an.instanceOf(orm.getClass('person'));
				expect(person.get('id')).to.equal(7);
			});
		});

		it('Should get a specific model from the repository with a single where', function () {
			return orm.factory('person').where('id').isEqual(7).find().then(function (person) {
				expect(person).to.exist;
				expect(person).to.be.an.instanceOf(orm.getClass('person'));
				expect(person.get('id')).to.equal(7);
			});
		});

		it('Should get a specific model from the repository with multiple wheres', function () {
			return orm.factory('person').where('id').isBetween(1, 10).where('email').isNull().find().then(function (person) {
				expect(person).to.exist;
				expect(person).to.be.an.instanceOf(orm.getClass('person'));
				expect(person.get('id')).to.equal(4);
			});
		});

		it('Should get all models from the repository', function () {
			return orm.factory('photo').findAll().then(function (photos) {
				var keys = [],
					expectedKeys = [];

				_.each(photos, function (photo) {
					keys.push(photo.get('id'));
				});

				_.each(data.photos, function (photo) {
					expectedKeys.push(photo.id);
				});

				expect(photos).to.exist;
				expect(photos).to.have.length(data.photos.length);
				expect(keys).to.include.members(expectedKeys);
			});
		});

		it('Should limit the number of records returned', function () {
			return orm.factory('photo').limit(5).findAll().then(function (photos) {
				var keys = [],
					expectedKeys = [];

				_.each(photos, function (photo) {
					keys.push(photo.get('id'));
				});

				_.each(data.photos, function (photo) {
					expectedKeys.push(photo.id);
				});

				expect(photos).to.exist;
				expect(photos).to.have.length(5);
				expect(keys).to.include.members(expectedKeys.slice(0,5));
			});
		});

		it('Should offset the records returned from a limited result set', function () {
			return orm.factory('photo').limit(5).offset(10).findAll().then(function (photos) {
				var keys = [],
					expectedKeys = [];

				_.each(photos, function (photo) {
					keys.push(photo.get('id'));
				});

				_.each(data.photos, function (photo) {
					expectedKeys.push(photo.id);
				});

				expect(photos).to.exist;
				expect(photos).to.have.length(5);
				expect(keys).to.include.members(expectedKeys.slice(10,5));
			});
		});

		it('Should order the result set by a key', function () {
			return orm.factory('photo').limit(5).orderBy('id', 'descending').findAll().then(function (photos) {
				var keys = [],
					rawPhotos = JSON.parse(JSON.stringify(data)).photos.reverse(),
					expectedKeys = [];

				_.each(photos, function (photo) {
					keys.push(photo.get('id'));
				});

				_.each(rawPhotos, function (photo) {
					expectedKeys.push(photo.id);
				});

				expect(photos).to.exist;
				expect(photos).to.have.length(5);
				expect(keys).to.include.members(expectedKeys.slice(0,5));
			});
		});

		it('Should get all models that match the where clause', function () {
			return orm.factory('photo').where('personId').isEqual(10).findAll().then(function (photos) {
				var keys = [];

				_.each(photos, function (photo) {
					keys.push(photo.get('id'));
				});

				expect(photos).to.exist;
				expect(photos).to.have.length(4);
				expect(keys).to.include.members([17,48,80,91]);
			});
		});

		it('Should get all models that match multiple where clauses', function () {
			return orm.factory('photo').where('personId').isEqual(10).where('id').isGreaterThan(20).findAll().then(function (photos) {
				var keys = [];

				_.each(photos, function (photo) {
					keys.push(photo.get('id'));
				});


				expect(photos).to.exist;
				expect(photos).to.have.length(3);
				expect(keys).to.include.members([48,80,91]);
			});
		});
	});

	describe('Create', function () {
		it('Should create and save an object and return the object with an id', function () {
			var data = {
				firstName: 'Codey',
				lastName: 'Whitt',
				email: 'codey.whitt@visualguruz.com'
			};

			return orm.factory('person').create(data).save().then(function (person) {
				expect(person).to.exist;
				expect(person.get('id')).to.exist;
				expect(person.get('firstName')).to.equal(data.firstName);
				expect(person.get('lastName')).to.equal(data.lastName);
				expect(person.get('email')).to.equal(data.email);
			});
		});
	});

	describe('Update', function () {
		it('Should update and save an object', function () {
			var id, email = 'codey.whitt+test@visualguruz.com', data = {
					firstName: 'Codey',
					lastName: 'Whitt',
					email: 'codey.whitt@visualguruz.com'
				};

			// Stage the data then start the test
			return orm.factory('person').create(data).save().then(function (person) {
				return orm.factory('person').where('id').isEqual(person.get('id')).find();
			}).then(function (person) {
				expect(person).to.exist;

				// Store the ID for retrieval
				id = person.get('id');

				return person.set('email', email).save();
			}).then(function (person) {
				expect(person).to.exist;
				expect(person.get('id')).to.equal(id);
				expect(person.get('firstName')).to.equal(data.firstName);
				expect(person.get('lastName')).to.equal(data.lastName);
				expect(person.get('email')).to.equal(email);

				return orm.factory('person').where('id').isEqual(id).find();
			}).then(function (person) {
				expect(person).to.exist;
				expect(person.get('id')).to.equal(id);
				expect(person.get('firstName')).to.equal('Codey');
				expect(person.get('lastName')).to.equal('Whitt');
				expect(person.get('email')).to.equal(email);
			});
		});
	});

	describe('Delete', function () {
		it('Should delete an object', function () {
			var id, data = {
				firstName: 'Codey',
				lastName: 'Whitt',
				email: 'codey.whitt@visualguruz.com'
			};

			// Stage the data then start the test
			return orm.factory('person').create(data).save().then(function (person) {
				id = person.get('id')
				return orm.factory('person').where('id').isEqual(id).find();
			}).then(function (person) {
				return person.delete();
			}).then(function (person) {
				return orm.factory('person').where('id').isEqual(id).find();
			}).then(function (person) {
				expect(person).to.not.exist;
			});
		});
	});
});