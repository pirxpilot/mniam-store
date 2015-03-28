var debug = require('debug')('connect:mniam-store');

module.exports = store;

var _defaults = {
  collection: 'sessions',
  maxAge: 8640  // millis in a day
};

function store(connect) {
  var Store = connect.session.Store;

  function MniamStore(options) {
    var maxAge;

    options = options || {};
    Store.call(this, options);

    maxAge = options.maxAge || _defaults.maxAge;

    this.sessions = options.db.collection({
      name: options.collection || _defaults.collection,
      indexes: [[{ _mod: 1 }, { expireAfterSeconds: maxAge }]]
    });
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

  MniamStore.prototype.set = function(sid, session, fn){

    var update = {
      $set: {
        session: JSON.stringify(session)
      },
      $currentDate: {
        _mod: true
      }
    };
    debug('Set "%s" - %s', sid, session);

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