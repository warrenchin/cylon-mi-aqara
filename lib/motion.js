/*jshint esversion: 6, -W116, -W035 */

const Subdevice = require('./subdevice');
const debug = require('./debuggers');

class Motion extends Subdevice {
  constructor(opts) {
    super(opts);

    this.heartbeatIntervalS = 60 * 60; // 1 hr

    this.events.push(
      'motion', // { old: true/false, new: true/false }
      'no_motion', // {old: new: 120/180/300/600/1200/... }
      'last_motion', // { old: datetime, new: datetime }
      'voltage', // { old, new }
      'lux' // { old, new }
    );
  }

  // noinspection JSUnusedGlobalSymbols
  onmessage(msg) {
    debug.recv('[%s] %o', this.name, msg);

    if ('voltage' in msg.data) this.prop.voltage = msg.data.voltage;
    if ('lux' in msg.data) this.prop.lux = msg.data.lux;

    if (msg.cmd === 'report') {
      // { cmd: 'report', model: 'motion', sid: '158d0000f085ee', short_id: 37841, data: { prop: 'motion' } }
      // { cmd: 'report', model: 'motion', sid: '158d0000f085ee', short_id: 37841, data: { no_motion: '120' } }
      // { cmd: 'report', model: 'motion', sid: '158d0000f085ee', short_id: 37841, data: { no_motion: '180' } }
      // { cmd: 'report', model: 'motion', sid: '158d0000f085ee', short_id: 37841, data: { no_motion: '300' } }
      // { cmd: 'report', model: 'motion', sid: '158d0000f085ee', short_id: 37841, data: { no_motion: '600' } }
      // { cmd: 'report', model: 'sensor_motion.aq2', sid: '158d0001e546da', short_id: 3639, data: { lux: '71' } }
      // { cmd: 'report', model: 'sensor_motion.aq2', sid: '158d0001e546da', short_id: 3639, data: { prop: 'motion' } }

      if ('status' in msg.data && msg.data.prop === 'motion') {
        this.prop.last_motion = Date.now();
        this.prop.motion = true;
      }
      else if ('no_motion' in msg.data) {
        this.prop.motion = false;
        this.prop.no_motion = msg.data.no_motion;
      }
    }
    else if (msg.cmd === 'heartbeat') {
    }
    else if (msg.cmd === 'read_ack') {
      // { cmd: 'read_ack', model: 'motion', sid: '158d0001209e4c', short_id: 41018, data: { voltage: 3075 } }
      // { cmd: 'read_ack', model: 'sensor_motion.aq2', sid: '158d0001e546da', short_id: 3639, data: { voltage: 3085, lux: '67' } }
    }
    else return false;

    return true;
  }
}

module.exports = Motion;

