/*jshint esversion: 6 */

const debug = require('debug');

module.exports = {
  info: debug('cylon:mi-aqara'),
  raw: debug('cylon:mi-aqara:raw'),
  send: debug('cylon:mi-aqara:tx'),
  recv: debug('cylon:mi-aqara:rx'),
  event: debug('cylon:mi-aqara:event')
};