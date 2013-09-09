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
		console.info(bar);
		process.exit(0);
	}, function (err) {
		console.error('Failed:', err.message);
	});
}, function (err) {
	console.error('Failed:', err.message);
});