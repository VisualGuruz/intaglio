var RSVP = require('rsvp');

RSVP.configure('onerror', function (error) {
	console.error(error.message);
	console.error(error.stack);
	throw(error);
});

module.exports = {
	repositories: require('./lib/repositories'),
	ORM: require('./lib/orm'),
	decorators: require('./lib/decorators'),
	utils: require('./lib/utils')
};