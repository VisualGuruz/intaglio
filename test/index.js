/**
 * Pull in the unit tests
 */
// require('./unit');


// This is just some test stuff for right meow
var Intaglio = require('../index');

var mysqlRepository = new Intaglio.repositories.mysql({
		host: "192.168.33.10",
		user: "test",
		password: "",
		database: "test_orm"
	}),
	ORM = Intaglio.ORM;

ORM.create(mysqlRepository).then(function (orm) {
	var foo = orm.factory('foo').create();

	foo.set({
		bar: 'test',
		baz: 'testing',
		hash: '123456',
		saltedHash: '984930'
	});

	foo.save().then(function (res) {
		console.info('Created!', res);
		foo.set({
			bar: 'really tested'
		}).save().then(function (res) {
			console.info('Saved!', res);
		}, err);
	}, err);

	orm.factory('foo').where('id').isBetween(2, 7).findAll().then(function (stuff) {
		stuff.forEach(function (item) {
			console.info('Item #'+item.get('id'));

			if (item.get('id') == 3) {
				item.delete().then(function () {
					console.info('Deleted #3');
				}, err);
			}
		});
	}, err);
}).then(null, err);

function err(error) {
	console.error('Failed:', error.message, error.stack);
	process.exit(1);
}