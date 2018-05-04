/*jshint esversion: 6, -W116, -W035 */

const Cylon = require('cylon');
const AqaraInterface = require('./aqara-interface');
const debug = require('./debuggers');

module.exports = class extends Cylon.Adaptor {
  constructor(opts) {
    super(opts);
  }

  // noinspection JSUnusedGlobalSymbols
  connect(callback) {

    this.aqara = new AqaraInterface();

    this.aqara.on('ready', () => {
      debug.info('%s ready', this.name);
      callback();
    });

    this.aqara.on('message', msg => this.emit("message", msg));
    this.aqara.start();
  }

  // noinspection JSMethodCanBeStatic, JSUnusedGlobalSymbols
  disconnect(callback) {
    callback();
  }

  getDevice(sid) {
    return this.aqara.getDevice(sid);
  }

  // noinspection JSUnusedGlobalSymbols
  send(msg) {
    this.aqara.send(msg);
  }

  // noinspection JSUnusedGlobalSymbols
  write(msg) {
    this.aqara.write(msg);
  }
};

