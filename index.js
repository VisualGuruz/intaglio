// This is just some test stuff for right meow
var ORM = require('./lib/orm');

var mysqlRepository = new ORM.repositories.mysql({
	host: "192.168.33.10",
	user: "test",
	password: "",
	database: "test_orm"
});

ORM.create(mysqlRepository).then(function (orm) {
	// orm.factory('bar').findAll().then(function (data) {
	// 	console.info(data);
	// }, err);

	// orm.factory('bar').find().then(function (data) {
	// 	console.info(data);
	// }, err);
	
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

	// orm.factory('foo').where('id').isBetween(2, 7).findAll().then(function (stuff) {
	// 	console.info(stuff);
	// }, err);
}).then(null, err);

function err(error) {
	console.error('Failed:', error.message, error.stack);
	process.exit(1);
}