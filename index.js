// This is just some test stuff for right meow
var MySQL = require('./lib/repositories/mysql'),
	ORM = require('./lib/orm');

var repo = new MySQL({
	host: "192.168.33.10",
	user: "test",
	password: "",
	database: "test_orm"
});

var m = new ORM(repo);

m.factory('foo');

console.info

repo.getSchema().then(function (result) {
	console.info(result);
	repo.find(result.bar).then(function (bar) {
		repo.create(result.bar, {thingy: "Inserted row!"}).then(function (newRow) {
			repo.find(result.bar).then(function (newBar) {
				repo.save(result.bar, {thingy: "Updated row!"}, {field: 'id', value: newBar.length}).then(function (up) {
					console.info(up);
					repo.find(result.bar).then(function (newerBar) {
						repo.delete(result.bar, {field: 'id', value: newerBar.length}).then(function (deleteRes) {
							console.info(deleteRes);
							repo.find(result.bar).then(function () {
								process.exit(0);
							}, err);
						}, err);
					}, err);
				}, err);
			}, err);
		}, err);
	}, err);
}, err);

function err(error) {
	console.error('Failed:', error.message, error.stack);
	process.exit(1);
}