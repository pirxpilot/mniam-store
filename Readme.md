[![Build Status](https://secure.travis-ci.org/code42day/mniam-store.png)](http://travis-ci.org/code42day/mniam-store)
[![Dependency Status](https://gemnasium.com/code42day/mniam-store.png)](https://gemnasium.com/code42day/mniam-store)
[![NPM version](https://badge.fury.io/js/mniam-store.png)](http://badge.fury.io/js/mniam-store)

# Mniam Store

mniam-store is a connect session store backed by [mongodb][]

[mniam][] is used to access as a access layer which means no async on init, simple configuration and
seamless connection sharing if your app is using DB

## Installation

	  $ npm install mniam-store

## Options

- `db` existing database created with mniam (can be shared with other parst of the app)
- `collection` name of the mongo collection to keep sessions in (default: sessions)
- `reapInterval` (millis) how often expired sessions should be purged - set to -1 to stop purging
- `ttl` - (millis) specifies how long sessions should stay in DB - defaults to session cookie
  `maxAge`, and if that is not specified either -- to 1 day

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
}))
```

If you use express you may do the following:

```javascript
var MniamStore = require('connect-redis')(express);
```

# License

MIT

[express]: http://expressjs.com
[mongodb]: http://www.mongodb.org
[connect]: http://www.senchalabs.org/connect
[session]: http://www.senchalabs.org/connect/session
[mniam]: http://npmjs.org/package/mniam
