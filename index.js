// This is just some test stuff for right meow
var repositories = require('./lib/repositories');

var repo = repositories.mysql({
	connection: {
		host: "192.168.33.10",
		user: "test",
		password: "",
		database: "test_orm"
	}
});

repo.getSchema().then(function (result) {
	repo.find(result.bar).then(function (bar) {
		repo.create(result.bar, {thingy: "Inserted row!"}).then(function (newRow) {
			console.info(newRow);
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
	console.error('Failed:', error.message);
	process.exit(1);
}