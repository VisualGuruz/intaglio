var utils = require('./../../../../lib/utils'),
	RSVP = require('rsvp'),
	Schema = require('./../../../../lib/orm/schema'),
	chai = require('chai'),
	should = chai.should(),
	expect = chai.expect,
	chaiAsPromised = require("chai-as-promised"),
	_ = require('underscore'),
	rawData = require('./../../../mock-data/data.json');

chai.use(chaiAsPromised);

/**
 * Modularized integration test suite that can be run against any repository.
 * @param repository
 */
module.exports = function (repository) {
	describe('Schema Generation', function () {
		it('Should return a promise object', function () {
			expect(repository.getSchema()).to.be.an.instanceOf(RSVP.Promise);
		});

		it('Should return a Schema object from the promise', function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					expect(schema).to.be.an.instanceOf(Schema.Schema);
				}).then(resolve, reject);
			});
		});

		it('Should return a schema with the correct values', function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					expect(schema.getModelNames()).to.include.members(['person', 'photo']);
					expect(schema.getModel('person').getPropertyNames()).to.include.members(['id', 'firstName', 'lastName', 'email']);
					expect(schema.getModel('photo').getPropertyNames()).to.include.members(['id', 'personId', 'guid', 'dateCreated']);
					resolve();
				}).then(null, reject);
			});
		});
	});

	describe('Find', function () {
		it('Should return a promise', function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					expect(repository.find(schema.getModel('person'))).to.be.an.instanceOf(RSVP.Promise);
				}).then(resolve, reject);
			});
		});

		it('Should find all data in the store for a model', function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					return repository.find(schema.getModel('person'));
				}).then(function (data) {
					expect(data).to.deep.equal(rawData.people);
				}).then(resolve, reject);
			});
		});

		it('Should find all data in the store for a model where a property is a value', function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					var photoModel = schema.getModel('photo'),
						condition = new repository.where.isEqual(photoModel.getProperty('personId').getOriginalName(), 1);

					return repository.find(photoModel, {}, [condition]);
				}).then(function (data) {
					var photos = _.where(rawData.photos, {person_id: 1});

					expect(data).to.deep.equal(photos);
				}).then(resolve, reject);
			});
		});

		it('Should find all data in the store for a model where a property is not a value', function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					var photoModel = schema.getModel('photo'),
						condition = new repository.where.isNotEqual(photoModel.getProperty('personId').getOriginalName(), 1);

					return repository.find(photoModel, {}, [condition]);
				}).then(function (data) {
					var photos = _.filter(rawData.photos, function (photo) {
						return photo.person_id !== 1;
					});

					expect(data).to.deep.equal(photos);
				}).then(resolve, reject);
			});
		});

		it('Should find all data in the store for a model where a property has a value in a range', function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					var photoModel = schema.getModel('photo'),
						condition = new repository.where.isBetween(photoModel.getProperty('id').getOriginalName(), [10,20]);

					return repository.find(photoModel, {}, [condition]);
				}).then(function (data) {
					var photos = _.filter(rawData.photos, function (photo) {
						return (photo.id >= 10 && photo.id <= 20);
					});

					expect(data).to.deep.equal(photos);
				}).then(resolve, reject);
			});
		});

		it("Should find all data in the store for a model where a property's value is greater than a specified value", function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					var photoModel = schema.getModel('photo'),
						condition = new repository.where.isGreaterThan(photoModel.getProperty('id').getOriginalName(), 50);

					return repository.find(photoModel, {}, [condition]);
				}).then(function (data) {
					var photos = _.filter(rawData.photos, function (photo) {
						return photo.id > 50;
					});

					expect(data).to.deep.equal(photos);
				}).then(resolve, reject);
			});
		});

		it("Should find all data in the store for a model where a property's value is greater than or equal to a specified value", function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					var photoModel = schema.getModel('photo'),
						condition = new repository.where.isGreaterThanOrEqual(photoModel.getProperty('id').getOriginalName(), 50);

					return repository.find(photoModel, {}, [condition]);
				}).then(function (data) {
					var photos = _.filter(rawData.photos, function (photo) {
						return photo.id >= 50;
					});

					expect(data).to.deep.equal(photos);
				}).then(resolve, reject);
			});
		});

		it("Should find all data in the store for a model where a property's value is less than a specified value", function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					var photoModel = schema.getModel('photo'),
						condition = new repository.where.isLessThan(photoModel.getProperty('id').getOriginalName(), 50);

					return repository.find(photoModel, {}, [condition]);
				}).then(function (data) {
					var photos = _.filter(rawData.photos, function (photo) {
						return photo.id < 50;
					});

					expect(data).to.deep.equal(photos);
				}).then(resolve, reject);
			});
		});

		it("Should find all data in the store for a model where a property's value is less than or equal to a specified value", function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					var photoModel = schema.getModel('photo'),
						condition = new repository.where.isLessThanOrEqual(photoModel.getProperty('id').getOriginalName(), 50);

					return repository.find(photoModel, {}, [condition]);
				}).then(function (data) {
					var photos = _.filter(rawData.photos, function (photo) {
						return photo.id <= 50;
					});

					expect(data).to.deep.equal(photos);
				}).then(resolve, reject);
			});
		});

		it('Should find all data in the store for a model where a property is null', function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					var personModel = schema.getModel('person'),
						condition = new repository.where.isNull(personModel.getProperty('email').getOriginalName());

					return repository.find(personModel, {}, [condition]);
				}).then(function (data) {
					var people = _.filter(rawData.people, function (person) {
						return person.email === null;
					});

					expect(data).to.deep.equal(people);
				}).then(resolve, reject);
			});
		});

		it('Should find all data in the store for a model where a property is not null', function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					var personModel = schema.getModel('person'),
						condition = new repository.where.isNotNull(personModel.getProperty('email').getOriginalName());

					return repository.find(personModel, {}, [condition]);
				}).then(function (data) {
					var people = _.filter(rawData.people, function (person) {
						return person.email !== null;
					});

					expect(data).to.deep.equal(people);
				}).then(resolve, reject);
			});
		});

		it('Should allow you to mix conditionals', function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					var personModel = schema.getModel('person'),
						conditions = [
							new repository.where.isNotNull(personModel.getProperty('email').getOriginalName()),
							new repository.where.isBetween(personModel.getProperty('id').getOriginalName(), [1,10])
						];

					return repository.find(personModel, {}, conditions);
				}).then(function (data) {
					var people = _.filter(rawData.people, function (person) {
						return (person.email !== null && person.id >= 1 && person.id <= 10);
					});

					expect(data).to.deep.equal(people);
				}).then(resolve, reject);
			});
		});

		it('Should return data found in a provided order', function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					var personModel = schema.getModel('person'),
						condition = new repository.where.isNotNull(personModel.getProperty('email').getOriginalName());

					return repository.find(personModel, {orderBy: 'lastName'}, [condition]);
				}).then(function (data) {
					var people = _.filter(rawData.people, function (person) {
						return person.email !== null;
					});

					people = _.sortBy(people, function (person) {
						return person.last_name;
					});

					expect(data).to.deep.equal(people);
				}).then(resolve, reject);
			});
		});

		it('Should return data found in a reverse order', function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					var personModel = schema.getModel('person'),
						condition = new repository.where.isNotNull(personModel.getProperty('email').getOriginalName());

					return repository.find(personModel, {orderBy: 'lastName', direction: 'descending'}, [condition]);
				}).then(function (data) {
					var people = _.filter(rawData.people, function (person) {
						return person.email !== null;
					});

					people = _.sortBy(people, function (person) {
						return person.last_name;
					});

					people.reverse();

					expect(data).to.deep.equal(people);
				}).then(resolve, reject);
			});
		});

		it('Should limit the number of items returned', function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					var personModel = schema.getModel('person'),
						condition = new repository.where.isNotNull(personModel.getProperty('email').getOriginalName());

					return repository.find(personModel, {orderBy: 'lastName', direction: 'descending', limit: 5}, [condition]);
				}).then(function (data) {
					var people = _.filter(rawData.people, function (person) {
						return person.email !== null;
					});

					people = _.sortBy(people, function (person) {
						return person.last_name;
					});

					people.reverse();

					people = people.slice(0, 5);

					expect(data).to.deep.equal(people);
				}).then(resolve, reject);
			});
		});

		it('Should offset the items returned', function () {
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					var personModel = schema.getModel('person'),
						condition = new repository.where.isNotNull(personModel.getProperty('email').getOriginalName());

					return repository.find(personModel, {orderBy: 'lastName', direction: 'descending', limit: 5, offset: 10}, [condition]);
				}).then(function (data) {
					var people = _.filter(rawData.people, function (person) {
						return person.email !== null;
					});

					people = _.sortBy(people, function (person) {
						return person.last_name;
					});

					people.reverse();

					people = people.slice(10, 15);

					expect(data).to.deep.equal(people);
				}).then(resolve, reject);
			});
		});
	});

	describe('Create', function () {
		it('Should return a promise', function () {
			var person = {
				firstName: "Ricky",
				lastName: "Bobby",
				email: "shakenbake@example.com"
			};

			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					expect(repository.create(schema.getModel('person'), person)).to.be.an.instanceOf(RSVP.Promise);
				}).then(resolve, reject);
			});
		});

		/**
		 * Currently, only repository generated IDs are supported. Client provided IDs are planned.
		 */
		it('Should allow you to create and object in the store and autogenerate an id', function () {
			var person = {
					first_name: "Ricky",
					last_name: "Bobby",
					email: "shakenbake@example.com"
				};

			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (schema) {
					var personModel = schema.getModel('person');

					return repository.create(personModel, person);
				}).then(function (data) {

					expect(data).to.contain.keys(['id', 'first_name', 'last_name', 'email']);

					// Should autogenerate the ID since it's not provided
					expect(data.id).to.not.be.null;
					expect(data.first_name).to.equal(person.first_name);
					expect(data.last_name).to.equal(person.last_name);
					expect(data.email).to.equal(person.email);

				}).then(resolve, reject);
			});
		});
	});

	describe('Save', function () {
		it('Should return a promise', function () {
			var schema;

			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (repoSchema) {
					schema = repoSchema;

					var personModel = schema.getModel('person'),
						condition = new repository.where.isEqual(personModel.getProperty('id').getOriginalName(), 1);


					return repository.find(personModel, {}, [condition]);
				}).then(function (people) {
					var person = people[0],
						newPerson = _.extend({}, person),
						personModel = schema.getModel('person');

					// Change something and save
					newPerson.email = "newguy@example.com";

					// Save it
					return repository.save(personModel, person, newPerson);
				}).then(resolve, reject);
			});
		});

		it('Should allow you to save an object in the store', function () {
			var schema;
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (repoSchema) {
					schema = repoSchema;

					var personModel = schema.getModel('person'),
						condition = new repository.where.isEqual(personModel.getProperty('id').getOriginalName(), 1);


					return repository.find(personModel, {}, [condition]);
				}).then(function (people) {
					var person = people[0],
						newPerson = _.extend({}, person),
						personModel = schema.getModel('person');

					// Change something and save
					newPerson.email = "newguy@example.com";

					// Save it
					return repository.save(personModel, person, newPerson);
				}).then(function (person) {
					var personModel = schema.getModel('person'),
						condition = new repository.where.isEqual(personModel.getProperty('id').getOriginalName(), 1);

					return repository.find(personModel, {}, [condition]);

				}).then(function (people) {
					expect(people).to.be.ok;
					expect(people[0]).to.be.ok;
					expect(people[0].email).to.equal("newguy@example.com");
				}).then(resolve, reject);
			});
		});
	});

	describe('Delete', function () {
		it('Should allow you to delete an object from the store', function () {
			var schema;
			return new RSVP.Promise(function (resolve, reject) {
				repository.getSchema().then(function (repoSchema) {
					schema = repoSchema;

					var personModel = schema.getModel('person'),
						condition = new repository.where.isEqual(personModel.getProperty('id').getOriginalName(), 1);


					return repository.find(personModel, {}, [condition]);
				}).then(function (people) {
						var person = people[0],
							personModel = schema.getModel('person');

						// Save it
						return repository.delete(personModel, person);
					}).then(function () {
						var personModel = schema.getModel('person'),
							condition = new repository.where.isEqual(personModel.getProperty('id').getOriginalName(), 1);

						return repository.find(personModel, {}, [condition]);
					}).then(function (people) {
						expect(people).to.be.empty;
					}).then(resolve, reject);
			});
		});
	});
};