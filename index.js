// This is just some test stuff for right meow
var ORM = require('./lib/orm');

var mysqlRepository = new ORM.repositories.mysql({
	host: "192.168.33.10",
	user: "test",
	password: "",
	database: "test_orm"
});

ORM.create(mysqlRepository).then(function (orm) {
	orm.factory('bar').find().then(function (data) {
		console.info(data);
	}, err);
	orm.factory('bar').find().then(function (data) {
		console.info(data);
	}, err);
}).then(null, err);

function err(error) {
	console.error('Failed:', error.message, error.stack);
	process.exit(1);
}