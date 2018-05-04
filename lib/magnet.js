/*jshint esversion: 6, -W116, -W035 */

const Subdevice = require('./subdevice');
const debug = require('./debuggers');

class Magnet extends Subdevice {
  constructor(opts) {
    super(opts);

    this.heartbeatIntervalS = 60 * 60; // 1 hr

    this.events.push(
      'status', // open/close
      'last_open', // datetime
      'last_close' // datetime
    );
  }

  // noinspection JSUnusedGlobalSymbols
  onmessage(msg) {
    debug.recv('[%s] %o', this.name, msg);

    if ('voltage' in msg.data) this.prop.voltage = msg.data.voltage;

    if ('status' in msg.data) {
      let current = msg.data.prop;
      this.prop.prop = current;
      this.prop['last_' + current] = Date.now();
    }

    if (msg.cmd === 'report') {
    }
    else if (msg.cmd === 'heartbeat') {
      // { cmd: 'heartbeat', model: 'magnet', sid: '158d0000d619b5', short_id: 62530, data: { voltage: 3055, prop: 'close' } }
    }
    else if (msg.cmd === 'read_ack') {
      // { cmd: 'read_ack', model: 'magnet', sid: '158d0000d619b5', short_id: 62530, data: { voltage: 3055, prop: 'close' } }
    }
    else return false;

    return true;
  }
}

module.exports = Magnet;

