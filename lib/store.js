var util = require('util');
var debug = require('debug')('connect:mniam-store');

module.exports = store;

var _defaults = {
  collection: 'sessions',
  maxAge: 8640  // millis in a day
};

function parseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
}

function serializeSession(session) {
  var obj = {};
  Object.keys(session).forEach(function (prop) {
    if (prop !== 'cookie') {
      obj[prop] = session[prop];
    }
  });
  ['expires', 'originalMaxAge'].forEach(function(prop) {
    if (session.cookie[prop]) {
      obj.cookie = obj.cookie || {};
      obj.cookie[prop] = session.cookie.prop;
    }
  });
  return obj;
}

function deserializeSession(obj) {
  var session = typeof obj === 'string'
    ? parseJSON(obj)
    : obj;

  session.cookie = session.cookie || {};
  return session;
}

function store(middleware) {
  var Store = middleware.Store || middleware.session.Store;

  function MniamStore(options) {
    var maxAge = options.maxAge || _defaults.maxAge;
    
    Store.call(this, options);
    this.sessions = options.db.collection({
      name: options.collection || _defaults.collection,
      indexes: [[{ _mod: 1 }, { expireAfterSeconds: maxAge }]]
    });
  }

  util.inherits(MniamStore, Store);

  /**
   * Attempt to fetch session by the given `sid`.
   *
   * @param {String} sid
   * @param {Function} fn
   * @api public
   */

  MniamStore.prototype.get = function(sid, fn){
    debug('Get "%s"', sid);
    this.sessions.find({_id:sid}, null, null, function(err, data) {
      var session;
      if (err || !data || !data.length) {
        return fn(err);
      }
      session = deserializeSession(data[0].session);
      debug('Got %j', session);
      fn(null, session);
    });
  };

  /**
   * Commit the given `sess` object associated with the given `sid`.
   *
   * @param {String} sid
   * @param {Session} sess
   * @param {Function} fn
   * @api public
   */

  MniamStore.prototype.set = function(sid, session, fn){
    var update = {
      $set: {
        session: serializeSession(session)
      },
      $currentDate: {
        _mod: true
      }
    };
    debug('Set "%s" - %j', sid, session);

    this.sessions.update(sid, update, fn);
  };

  MniamStore.prototype.touch = function(sid, session, fn) {
    var update = {
      $currentDate: {
        _mod: true
      }
    };
    debug('Touch "%s"', sid);

    this.sessions.update(sid, update, fn);
  };

  /**
   * Destroy the session associated with the given `sid`.
   *
   * @param {String} sid
   * @api public
   */

  MniamStore.prototype.destroy = function(sid, fn){
    debug('Destroy "%s"', sid);
    this.sessions.remove({_id: sid}, fn);
  };

  return MniamStore;
}
