[![Build Status](https://img.shields.io/travis/code42day/mniam-store.svg)](http://travis-ci.org/code42day/mniam-store)
[![Dependency Status](https://img.shields.io/gemnasium/code42day/mniam-store.svg)](https://gemnasium.com/code42day/mniam-store)
[![NPM version](https://img.shields.io/npm/v/mniam-store.svg)](http://badge.fury.io/js/mniam-store)

# Mniam Store

mniam-store is a connect session store backed by [mongodb][]

[mniam][] is used to access as a access layer which means no async on init, simple configuration and
seamless connection sharing if your app is using DB

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
}))
```


# License

MIT

[express]: http://expressjs.com
[mongodb]: http://www.mongodb.org
[connect]: http://www.senchalabs.org/connect
[session]: http://www.senchalabs.org/connect/session
[mniam]: http://npmjs.org/package/mniam
