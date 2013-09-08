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
	console.log(result);
	process.exit(0);
}, function (err) {
	console.error('Failed:', err.message);
});