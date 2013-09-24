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
	// 
	var foo = orm.factory('foo').create();

	foo.set({
		bar: 'test',
		baz: 'testing',
		hash: '123456',
		saltedHash: '984930'
	});

	console.info(foo)

	foo.save().then(function (res) {
		console.info('Saved!');
	}, err);
}).then(null, err);

function err(error) {
	console.error('Failed:', error.message, error.stack);
	process.exit(1);
}