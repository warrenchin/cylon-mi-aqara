/*jshint esversion: 6, -W116, -W035 */

const Subdevice = require('./subdevice');
const debug = require('./debuggers');

class WaterLeak extends Subdevice {
	constructor(opts) {
		super(opts);

		this.heartbeatIntervalS = 60 * 60; // 1 hr

		this.events.push (
			'leak', // { old, new: true/false }
			'voltage' // { old, new }
		);
	}

	// noinspection JSUnusedGlobalSymbols
	onmessage(msg) {
		debug.recv('[%s] %o', this.name, msg);

		if ('voltage' in msg.data) this.status.voltage = msg.data.voltage;
		if ('status' in msg.data) this.status.leak = (msg.data.staus === 'leak');

		if (msg.cmd === 'report') {
			// { cmd: 'report', model: 'sensor_wleak.aq1', sid: '158d0001d779c6', short_id: 47495, data: { status: 'no_leak' } }
			//{ cmd: 'report', model: 'sensor_wleak.aq1', sid: '158d0001d779c6', short_id: 47495, data: { status: 'leak' } }
		}
		else if (msg.cmd === 'heartbeat') {
			// { cmd: 'heartbeat', model: 'sensor_wleak.aq1', sid: '158d0001d779c6', short_id: 47495, data: { voltage: 3015 } }
		}
		else if (msg.cmd === 'read_ack') {
			// { cmd: 'read_ack', model: 'sensor_wleak.aq1', sid: '158d0001d779c6', short_id: 47495, data: { voltage: 3015 } }
		}
		else return false;

		return true;
	}
}

module.exports = WaterLeak;

