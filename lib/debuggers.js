/*jshint esversion: 6 */

const debug = require('debug');

const info = debug('cylon:mi-aqara');
const raw =  debug('cylon:mi-aqara:rx:raw');
const send = debug('cylon:mi-aqara:tx');
const recv = debug('cylon:mi-aqara:rx');
const event = debug('cylon:mi-aqara:event');

module.exports = {
	info, raw, send, recv, event
};