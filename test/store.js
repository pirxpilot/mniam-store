const should = require('should');
const sessionMiddleware = require('express-session');
const MniamStore = require('../lib/store')(sessionMiddleware);

const db = require('mniam').db('mongodb://localhost/mniam-store-test');
const sessions = db.collection({
  name: 'sessions'
});

/*global describe, it, after, beforeEach */

describe('MniamStore', function () {
  const key = 'abcd-efgh';
  const value = {
    user: 'Bob',
    cookie: new sessionMiddleware.Cookie()
  };

  beforeEach(function(done) {
    sessions.removeMany({}, done);
  });

  after(function() {
    sessions.close();
  });

  it('should set session data', function (done) {
    const store = new MniamStore({ db });

    store.set(key, value, function(err) {
      should.not.exist(err);

      sessions.findOne({ _id: key }, function(err, sess) {
        should.not.exist(err);
        should.exist(sess);

        sess.should.have.property('_mod');
        sess._mod.should.be.below(new Date());

        sess.should.have.property('session');
        sess.session.should.have.property('user', 'Bob');

        store.close();
        done();
      });
    });
  });

  it('should update timestamp when touched', function (done) {
    const store = new MniamStore({ db });
    let modOrig;

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

            store.close();
            done(err);
          });
        });
      });
    });
  });

  it('should ignore touch to non-existing sessions', function (done) {
    const store = new MniamStore({ db });

    store.touch(key, null, function(err) {
      should.not.exist(err);
      sessions.findOne({ _id: key }, function(err, sess) {
        should.not.exist(sess);
        store.close();
        done();
      });
    });
  });

  it('should get session data', function (done) {
    const store = new MniamStore({ db });

    sessions.insertOne({
      _id: key,
      session: value,
    }, function(err) {
      should.not.exist(err);

      store.get(key, function (err, session) {
        should.not.exist(err);

        should.exist(session);
        session.should.have.property('user', 'Bob');
        session.should.have.property('cookie');
        store.close();
        done();
      });
    });
  });

  it('should destroy session data', function (done) {
    const store = new MniamStore({ db });

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
            store.close();

            done();
          });
        });
      });
    });
  });
});
