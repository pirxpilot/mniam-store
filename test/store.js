const { after, describe, beforeEach, it } = require('node:test');

const should = require('should');
const sessionMiddleware = require('express-session');
const MniamStore = require('../lib/store')(sessionMiddleware);

const db = require('mniam').db('mongodb://localhost/mniam-store-test');

describe('MniamStore', function () {
  const key = 'abcd-efgh';
  const value = {
    user: 'Bob',
    cookie: new sessionMiddleware.Cookie()
  };
  const sessions = db.collection({
    name: 'sessions'
  });

  beforeEach(function () {
    return db.drop();
  });

  after(async function () {
    await db.drop();
    await db.close();
  });

  it('should set session data', function (_, done) {
    const store = new MniamStore({ db });

    store.set(key, value, function (err) {
      should.not.exist(err);

      sessions.findOne({ _id: key }).then(sess => {
        should.exist(sess);

        sess.should.have.property('_mod');
        sess._mod.should.be.below(new Date());

        sess.should.have.property('session');
        sess.session.should.have.property('user', 'Bob');

        done();
      }, done);
    });
  });

  it('should update timestamp when touched', function (_, done) {
    const store = new MniamStore({ db });
    let modOrig;

    store.set(key, value, function (err) {
      should.not.exist(err);

      sessions.findOne({ _id: key }).then(sess => {
        should.exist(sess);

        modOrig = sess._mod;

        store.touch(key, null, function (err) {
          should.not.exist(err);

          sessions.findOne({ _id: key }).then(sess => {
            should.exist(sess);

            modOrig.should.be.below(sess._mod);

            done(err);
          }, done);
        });
      }, done);
    });
  });

  it('should ignore touch to non-existing sessions', function (_, done) {
    const store = new MniamStore({ db });

    store.touch(key, null, function (err) {
      should.not.exist(err);
      sessions.findOne({ _id: key }).then(sess => {
        should.not.exist(sess);
        done();
      }, done);
    });
  });

  it('should get session data', function (_, done) {
    const store = new MniamStore({ db });

    sessions.insertOne({ _id: key, session: value, }).then(() => {
      store.get(key, function (err, session) {
        should.not.exist(err);

        should.exist(session);
        session.should.have.property('user', 'Bob');
        session.should.have.property('cookie');
        done();
      });
    }, done);
  });

  it('should return empty when no session found', function (_, done) {
    const store = new MniamStore({ db });

    store.get('_not_here', function (err, session) {
      should.not.exist(err);
      should.not.exist(session);
      done();
    });
  });

  it('should destroy session data', function (_, done) {
    const store = new MniamStore({ db });

    store.set(key, value, function (err) {
      should.not.exist(err);

      sessions.find().then(all => {
        all.should.have.length(1);

        store.destroy(key, function (err) {
          should.not.exist(err);

          sessions.find().then(all => {
            all.should.have.length(0);
            done();
          }, done);
        });
      }, done);
    });
  });
});
