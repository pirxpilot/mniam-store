const debug = require('debug')('connect:mniam-store');

module.exports = store;

function parseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
}

function serializeSession(session) {
  const obj = {};
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
  const session = typeof obj === 'string' ? parseJSON(obj) : obj;

  session.cookie = session.cookie || {};
  return session;
}

function store(middleware) {
  const Store = middleware.Store || middleware.session.Store;

  class MniamStore extends Store {
    constructor(options) {
      super(options);

      const {
        maxAge = 8640,  // millis in a day
        collection = 'sessions'
      } = options;
      this.sessions = options.db.collection({
        name: collection,
        indexes: [[{ _mod: 1 }, { expireAfterSeconds: maxAge }]]
      });
    }

    /**
     * Attempt to fetch session by the given `sid`.
     *
     * @param {String} sid
     * @param {Function} fn
     * @api public
     */

    get(sid, fn) {
      debug('Get "%s"', sid);
      this.sessions.find({ _id: sid }, null, null, function(err, data) {
        let session;
        if (err || !data || !data.length) {
          return fn(err);
        }
        session = deserializeSession(data[0].session);
        debug('Got %j', session);
        fn(null, session);
      });
    }

    /**
     * Commit the given `sess` object associated with the given `sid`.
     *
     * @param {String} sid
     * @param {Session} sess
     * @param {Function} fn
     * @api public
     */

    set(sid, session, fn) {
      const update = {
        $set: {
          session: serializeSession(session)
        },
        $currentDate: {
          _mod: true
        }
      };
      debug('Set "%s" - %j', sid, session);

      this.sessions.update(sid, update, fn);
    }

    touch(sid, session, fn) {
      const update = {
        $currentDate: {
          _mod: true
        }
      };
      debug('Touch "%s"', sid);

      this.sessions.update(sid, update, { upsert: false }, fn);
    }

    /**
     * Destroy the session associated with the given `sid`.
     *
     * @param {String} sid
     * @api public
     */

    destroy(sid, fn) {
      debug('Destroy "%s"', sid);
      this.sessions.remove({ _id: sid }, fn);
    }
  }

  return MniamStore;
}
