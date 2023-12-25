
4.0.0 / 2023-12-25
==================

 * upgrade mniam to ~4
 * use @pirxpilot/jshint instead of jshint
 * use `node:test` instead of `mocha`

3.0.1 / 2022-08-24
==================

 * return empty/null session when no session found

3.0.0 / 2022-06-03
==================

 * upgrade mniam

2.0.0 / 2018-12-25
==================

 * upgrade to newer mniam version
 * add store.close() method
 * rewrite in ES6

1.2.2 / 2017-02-22
==================

 * transfer repo to pirxpilot

1.2.1 / 2015-06-12
==================

 * fix: ignore touch performent on an invalid session

1.2.0 / 2015-06-11
==================

 * update should ~5 -> ~6
 * save session as an object and not as a serialized JSON
 * replace connect with express-session in tests

1.1.0 / 2015-03-30
==================

 * enable initializing with session middleware
 * implement touch method

1.0.0 / 2015-03-28
==================

 * expire sessions using mongo TTL index

0.1.0 / 2013-09-14 
==================

 * Basic implementation of mniam store
