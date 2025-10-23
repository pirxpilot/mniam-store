import { after, beforeEach, describe, it } from 'node:test';
import sessionMiddleware from 'express-session';
import * as mniam from 'mniam';
import makeStore from '../lib/store.js';

const MniamStore = makeStore(sessionMiddleware);
const db = mniam.db('mongodb://localhost/mniam-store-test');

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

  it('should set session data', function (t, done) {
    const store = new MniamStore({ db });

    store.set(key, value, function (err) {
      t.assert.ifError(err);

      sessions.findOne({ _id: key }).then(sess => {
        t.assert.ok(sess);

        t.assert.ok('_mod' in sess);
        t.assert.ok(sess._mod < new Date());

        t.assert.ok('session' in sess);
        t.assert.equal(sess.session.user, 'Bob');

        done();
      }, done);
    });
  });

  it('should update timestamp when touched', function (t, done) {
    const store = new MniamStore({ db });
    let modOrig;

    store.set(key, value, function (err) {
      t.assert.ifError(err);

      sessions.findOne({ _id: key }).then(sess => {
        t.assert.ok(sess);

        modOrig = sess._mod;

        store.touch(key, null, function (err) {
          t.assert.ifError(err);

          sessions.findOne({ _id: key }).then(sess => {
            t.assert.ok(sess);

            t.assert.ok(modOrig < sess._mod);

            done(err);
          }, done);
        });
      }, done);
    });
  });

  it('should ignore touch to non-existing sessions', function (t, done) {
    const store = new MniamStore({ db });

    store.touch(key, null, function (err) {
      t.assert.ifError(err);
      sessions.findOne({ _id: key }).then(sess => {
        t.assert.equal(sess, null);
        done();
      }, done);
    });
  });

  it('should get session data', function (t, done) {
    const store = new MniamStore({ db });

    sessions.insertOne({ _id: key, session: value }).then(() => {
      store.get(key, function (err, session) {
        t.assert.ifError(err);

        t.assert.ok(session);
        t.assert.equal(session.user, 'Bob');
        t.assert.ok('cookie' in session);
        done();
      });
    }, done);
  });

  it('should return empty when no session found', function (t, done) {
    const store = new MniamStore({ db });

    store.get('_not_here', function (err, session) {
      t.assert.ifError(err);
      t.assert.equal(session, null);
      done();
    });
  });

  it('should destroy session data', function (t, done) {
    const store = new MniamStore({ db });

    store.set(key, value, function (err) {
      t.assert.ifError(err);

      sessions.find().then(all => {
        t.assert.equal(all.length, 1);

        store.destroy(key, function (err) {
          t.assert.ifError(err);

          sessions.find().then(all => {
            t.assert.equal(all.length, 0);
            done();
          }, done);
        });
      }, done);
    });
  });
});
