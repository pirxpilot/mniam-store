[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

# Mniam Store

mniam-store is a connect session store backed by [mongodb]

[mniam] is used to access as a access layer which means no async on init, simple configuration and
seamless connection sharing if your app is using DB

mniam-store is compatible with [express-session] middleware

## Installation

	  $ npm install mniam-store

## Options

- `db` existing database created with mniam (can be shared with other parst of the app)
- `collection` name of the mongo collection to keep sessions in (default: sessions)
- `maxAge` - (seconds) specifies how long sessions should stay in DB - should be set-up to a value slightly larger than `cookie.maxAge` - defaults to 1 day

## Usage

Similar to other connect [session][] stores.

```javascript
var connect = require('connect');
var mniam = require('mniam');
var MniamStore = require('mniam-store')(connect);

// use DB for mniam store only or share it with other parts of the app
var db = mniam.db('mongourl://localhost/database');

connect().use(connect.session({
  store: new MniamStore({
    db: db
  })
}));
```

## Upgrading from 0.x

Since `mniam-store` is using [mongo TTL index](http://docs.mongodb.org/manual/core/index-ttl/) sessions created with
previous versions will not expire automatically. We need to time stamp old sessions after the upgrade:

```javascript
db.sessions.update(
  {_mod: {$exists:0}},
  {$currentDate:{_mod:true}},
  {multi:true}
);
```

And drop old index in `expires`:

```javascript
db.sessions.dropIndex({expires:1});
```

# License

MIT

[express]: http://expressjs.com
[mongodb]: http://www.mongodb.org
[connect]: http://www.senchalabs.org/connect
[session]: http://www.senchalabs.org/connect/session
[mniam]: https://www.npmjs.com/package/mniam
[express-session]: https://www.npmjs.com/express-session

[npm-image]: https://img.shields.io/npm/v/mniam-store
[npm-url]: https://npmjs.org/package/mniam-store

[build-url]: https://github.com/pirxpilot/mniam-store/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/actions/workflow/status/pirxpilot/mniam-store/check.yaml?branch=main

[deps-image]: https://img.shields.io/librariesio/release/npm/mniam-store
[deps-url]: https://libraries.io/npm/mniam-store

