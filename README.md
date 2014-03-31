# Intaglio

**Note: These docs are in the process of being written. The code examples are up to date, but not exhaustive.**

Intaglio is an awesome, define-once, use anywhere ORM. The goals of this project are to make an easy to use, persistence independent ORM for JavaScript that can be used in the front or back end to make rapid prototyping and development a breeze. Intaglio takes an ActiveRecord style approach to defining models by allowing your repositories (persistent storage handlers) to define the schema.

## Installation

To use with NPM:

```bash
npm install --save intaglio
```

To use with Bower

```bash
bower install --save intaglio
```

### Quick-Start Guide

To get up and running quickly with Node and MySQL, here's how you would instantiate the ORM:

```javascript
var Intaglio = require('intaglio');

/**
 * Instantiate the MySQL repository that the ORM will bind to.
 */
var repository = new Intaglio.repositories.mysql({
		host: "localhost",
		user: "db_user",
		password: "password",
		database: "database_name"
});

/**
 * Create an ORM to work with. This returns a promise because the ORM must wait
 * for the repository to become ready. The MySQL repository makes a few queries
 * on instantiation to get the database structure. We can't start using it until
 * these calls have completed.
 */
Intaglio.ORM.create(repository).then(function (ORM) {
	/**
	 * ORM is now ready to be used. Let's grab a user with an ID of 1. This will
	 * return a promise for us to use.
	 */
	ORM.factory('user').find(1).then(function (user) {
		// Do stuff with user. Would output user@example.com
		console.info(user.get('email'));

		// Update the user and save the model
		user.set('email', 'example@intagl.io').save().then(function (user) {
			// Out: Updated the email to example@intagl.io
			console.info('Updated the email to', user.get('email'));
		});
	});
});
```

## Repositories

Currently, Intaglio ships with a MySQL and a REST respository (designed to be used with the [Intaglio based REST server](https://github.com/VisualGuruz/intaglio-rest)) to get you up and running quickly. The MySQL repository will use database introspection to define your model schema so all you need to provide are the connection details to get started using with Node. The REST repository comes with a [Request](https://github.com/mikeal/request) based driver as well as a jQuery based one to be used on the front end.

## Using the ORM

### Considerations

The ORM should be pretty easy to use, but there are some things to keep in mind. We made some design decisions to make the implentation simpler and easier to maintain.

#### Naming Conventions

The ORM will not care what names you use on the repository side, but it will normalize them to make it easier to code around.  All model names and property names will be normalized to camelCase. Model names will also be made singular. So if your repository provides a model named `user_profiles`, it will be normalized to `userProfile`.

#### Primary Keys

The ORM will expect some sort of primary key to bind to. Also, while multiple column keys can be used, they are not well tested, so if you use them, let us know what issues you run into.

### Schema Used for the Examples

In the following examples, we'll use a `user` model that has the following schema:

- id (Primary Key)
- email
- first_name
- last_name

### Creating Objects from Models

```javascript
// Create an empty user object
var user = ORM.factory('user').create();

// Set a single value to the object
user.set('email', 'thedude@lebowski.com');

// Set multiple values to the object
user.set({
    firstName: "Jeffery",
    lastName: "Lebowski"
});

// Save the object. This returns a promise.
user.save().then(function (user) {
    console.info('User created with an ID of', user.get('id'));
});

// Create an object with values and save it
ORM.factory('user').create({
    firstName: "Walter",
    lastName: "Sobchak",
    email: "walter@lebowski.com"
}).save().then(function (user) {
    console.info('User created with an ID of', user.get('id'));
});
```

### Finding Objects

In order to make things easy to use, Intaglio relies on natural language chain style queries:

```javascript
// Finds and returns the first model in the repository that has the firstName of Donny
ORM.factory('user').where('firstName').isEqual('Donny').find().then(function (user){
    // If no user was found, user will be null
    if (user === null)
        throw new Exception('Could not find Donny!');
});

// Finds and returns all models in the repository that have the firstName of Donny
ORM.factory('user').where('firstName').isEqual('Donny').findAll().then(function (users){
    // If no user was found, user will be an empty array
    if (users.length === 0)
        throw new Exception('Could not find Donny!');

    console.info('Number of Donnys found:', users.length);
});

// Finds a user with an id of 1
ORM.factory('user').find(1).then(function (user) {
	// Do stuff with user. Would thedude@lebowski.com
	console.info(user.get('email'));
});
```

### Updating Objects

```javascript
ORM.factory('user').find(1).then(function (user) {
	// Do stuff with user. Would output thedude@lebowski.com
	console.info(user.get('email'));

	// Update the user and save the model
	user.set('email', 'el_duderino@lebowski.com').save().then(function (user) {
		// Out: Updated the email to example@intagl.io
		console.info('Updated the email to', user.get('email'));
	});
});
```

### Deleting Objects

```javascript
ORM.factory('user').where('firstName').isEqual('Donny').find().then(function (donny){
    // Delete Donny
    donny.delete().then(function(){
        console.info('Goodnight, sweet prince.');
    });
});
```

### Extend Models

To add methods to models or override functionality, you can extend the model. If you override a method, you can access the original method using `this._super`.

```javascript
// Extend the user model
ORM.extend('user', {
    say: function (said) {
        console.info(this.get('firstName'), ':', said);
        this.trigger('spoke');
    },
    save: function () {
        console.info("I'm saved!");
        return this._super.apply(this, arguments);
    }
});
```

### Events

The models in the ORM have a few built in events that you can bind to:

```javascript
// Load Walter
ORM.factory('user').where('firstName').isEqual('Walter').find().then(function (walter){
    walter.on('saved', function (meta) {
        if (meta.changed.length > 0)
            console.info('Walter was updated!');
    });

    // Will log 'Walter was updated!' once the save is complete
    walter.set('email', 'walter@sobchak.com').save();

    // To trigger an event: Will log 'Walter was updated!'
    walter.trigger('saved');
});
```

#### Custom Events

```javascript
// Extend the user model to add a custom functionality that triggers a custom event
ORM.extend('user', {
    say: function (said) {
        console.info(this.get('firstName'), ':', said);
        this.trigger('spoke', said);
    }
});

var Walter, Donny;

// Load Walter
ORM.factory('user').where('firstName').isEqual('Walter').find().then(function (walter){
    // Set Walter so we can use him in other callbacks
	Walter = walter;

	// Load Donny
	return ORM.factory('user').where('firstName').isEqual('Donny').find();
}).then(function (donny){
    // Set Donny so we can use him in other callbacks
	Donny = donny;
}).then(function () {
	// Setup the events
	Donny.on('spoke', function () {
		Walter.say('Shut the fuck up, Donny!');
	});

	// Are those the Nazis, Walter?
	Donny.say('I am the walrus.');
});
```