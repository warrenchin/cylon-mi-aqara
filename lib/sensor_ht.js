/*jshint esversion: 6, -W116, -W035 */

const Subdevice = require('./subdevice');
const debug = require('./debuggers');

class SensorHT extends Subdevice {
  constructor(opts) {
    super(opts);

    this.heartbeatIntervalS = 60 * 60; // 1 hr

    this.events.push(
      'humidity',  // { old: new: }
      'temperature', // { old: new: }
      'pressure', // { old: new: }
      'voltage' // { old: new: }
    );
  }

  // noinspection JSUnusedGlobalSymbols
  onmessage(msg) {
    debug.recv('[%s] %o', this.name, msg);

    for (let key in msg.data) {
      if (msg.data.hasOwnProperty(key)) this.prop[key] = msg.data[key];
    }

    if (msg.cmd === 'report') {
      // { cmd: 'report', model: 'sensor_ht', sid: '158d0000f437c5', short_id: 57027, data: { humidity: '6068' } }
      // { cmd: 'report', model: 'sensor_ht', sid: '158d0000f437c5', short_id: 57027, data: { temperature: '2877' } }
    }
    else if (msg.cmd === 'heartbeat') {
      // { cmd: 'heartbeat', model: 'sensor_ht', sid: '158d00011436a6', short_id: 37150, data: { voltage: 3005, temperature: '2857', humidity: '4924' } }
    }
    else if (msg.cmd === 'read_ack') {
      // { cmd: 'read_ack', model: 'sensor_ht', sid: '158d0000f4370c', short_id: 45852, data: { voltage: 2795, temperature: '2870', humidity: '8126' } }
    }
    else return false;

    return true;
  }
}

module.exports = SensorHT;

