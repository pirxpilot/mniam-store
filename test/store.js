var should = require('should');
var sessionMiddleware = require('express-session');
var MniamStore = require('../lib/store')(sessionMiddleware);

var db = require('mniam').db('mongodb://localhost/mniam-store-test');
var sessions = db.collection({
  name: 'sessions'
});

/*global describe, it, after, beforeEach */

describe('MniamStore', function () {
  var key = 'abcd-efgh';
  var value = {
    user: 'Bob',
    cookie: new sessionMiddleware.Cookie()
  };

  beforeEach(function(done) {
    sessions.remove({}, done);
  });

  after(function() {
    sessions.close();
  });

  it('should set session data', function (done) {
    var store = new MniamStore({ db:db });

    store.set(key, value, function(err) {
      should.not.exist(err);

      sessions.findOne({ _id: key }, function(err, sess) {
        should.not.exist(err);
        should.exist(sess);

        sess.should.have.property('_mod');
        sess._mod.should.be.below(new Date());

        sess.should.have.property('session');
        sess.session.should.have.property('user', 'Bob');

        done();
      });
    });
  });

  it('should update timestamp when touched', function (done) {
    var store = new MniamStore({ db:db });
    var modOrig;

    store.set(key, value, function(err) {
      should.not.exist(err);

      sessions.findOne({ _id: key }, function(err, sess) {
        should.not.exist(err);
        should.exist(sess);

        modOrig = sess._mod;

        store.touch(key, null, function(err) {
          should.not.exist(err);

          sessions.findOne({ _id: key }, function(err, sess) {
            should.exist(sess);

            modOrig.should.be.below(sess._mod);
            done(err);
          });
        });
      });
    });
  });

  it('should get session data', function (done) {
    var store = new MniamStore({ db:db });

    sessions.save({
      _id: key,
      session: value,
    }, function(err) {
      should.not.exist(err);

      store.get(key, function (err, session) {
        should.not.exist(err);

        should.exist(session);
        session.should.have.property('user', 'Bob');
        session.should.have.property('cookie');
        done();
      });
    });
  });

  it('should destroy session data', function (done) {
    var store = new MniamStore({ db:db });

    store.set(key, value, function(err) {
      should.not.exist(err);

      sessions.find({}, null, null, function(err, all) {
        should.not.exist(err);
        all.should.have.length(1);

        store.destroy(key, function(err) {
          should.not.exist(err);

          sessions.find({}, null, null, function(err, all) {
            should.not.exist(err);
            all.should.have.length(0);

            done();
          });
        });
      });
    });
  });
});
