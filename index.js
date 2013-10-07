var RSVP = require('rsvp');

RSVP.configure('onerror', function (error) {
	console.error(error.message);
});

module.exports = {
	repositories: require('./lib/repositories'),
	ORM: require('./lib/orm'),
	wrappers: require('./lib/wrappers'),
	utils: require('./lib/utils')
};