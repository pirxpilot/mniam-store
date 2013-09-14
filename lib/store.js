var debug = require('debug')('connect:mniam-store');

module.exports = store;

var millisInDay = 86400000;

var _defaults = {
  collection: 'sessions',
  reapInterval: 600 * 1000 // once every 10 minutes
};

function store(connect) {
  var Store = connect.session.Store;

  function reapExpired(sessions, interval) {
    if (interval === -1) {
      return;
    }
    interval = interval || _defaults.reapInterval;
    var reapInterval = setInterval(function () {
      debug('Reap expired');
      sessions.remove({expires: {'$lte': Date.now()}}, function () { });
    }, interval);

    if (typeof reapInterval.unref === 'function') {
      reapInterval.unref();
    }
  }

  function MniamStore(options) {
    options = options || {};
    Store.call(this, options);

    this.ttl = options.ttl;
    this.sessions = options.db.collection({
      name: options.collection || _defaults.collection,
      indexes: [[{ expires: 1 }, { sparse: 1 }]]
    });
    reapExpired(this.sessions, options.reapInterval);
  }


  /**
   * Inherit from `Store`.
   */
  MniamStore.prototype.__proto__ = Store.prototype;

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
      data = data[0];
      try {
        session = typeof data.session === 'string'
          ? JSON.parse(data.session)
          : data.session;
        debug('Got %j', session);
        return fn(null, session);
      } catch (err) {
        return fn(err);
      }
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

  MniamStore.prototype.set = function(sid, sess, fn){
    var maxAge = sess.cookie.maxAge,
      session = JSON.stringify(sess),
      ttl;

    ttl = this.ttl || ('number' == typeof maxAge ? maxAge : millisInDay);

    var update = {_id: sid, session: session};
    update.expires = Date.now() + ttl;
    debug('Set "%s" - %j - %d', update._id, sess, update.expires);

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