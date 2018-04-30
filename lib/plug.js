/*jshint esversion: 6, -W116, -W035 */

const Subdevice = require('./subdevice');
const debug = require('./debuggers');

class Plug extends Subdevice {
	constructor(opts) {
		super(opts);

		this.heartbeatIntervalS = 10 * 60; // 10 minutes

		Object.assign(this.commands, {
			power: this.power,
			toggle: this.toggle
		});

		this.events.push (
			'voltage', // { old: new: }
			'status', // { old: new: on/off }
			'inused', // { old: new: 0/1 }
			'power_consumed', // { old: new: kwh }
			'load_power' // { old new: w }
		);
	}

	// noinspection JSUnusedGlobalSymbols
	onmessage(msg) {
		debug.recv('[%s] %o', this.name, msg);

		for (let key in msg.data) {
			if (msg.data.hasOwnProperty(key)) this.status[key] = msg.data[key];
		}

		if (msg.cmd === 'report') {
			// { cmd: 'report', model: 'plug', sid: '158d0000f85465', short_id: 41367, data: { status: 'off' } }
		}
		else if (msg.cmd === 'heartbeat') {
			// { cmd: 'heartbeat', model: 'plug', sid: '158d0000f9c126', short_id: 50320,
			// data: { voltage: 3600, status: 'off', inuse: '0', power_consumed: '37232', load_power: '0.00' } }
		}
		else if (msg.cmd === 'read_ack') {
			// { cmd: 'read_ack', model: 'plug', sid: '158d0000f85465', short_id: 41367,
			// data: { voltage: 3600, status: 'on', inuse: '1', power_consumed: '4383', load_power: '14.37' } }
		}
		else if (msg.cmd === 'write_ack') {
			// { cmd: 'write_ack', model: 'plug', sid: '158d0000f85465', short_id: 41367, data: { voltage: 3600, status: 'off', inuse: '0', power_consumed: '4469', load_power: '0.00' } }
		}
		else return false;

		return true;
	}

	power(state) {
		let status = state? 'on' : 'off';
		this.device.write( { status } );
	}

	toggle() {
		let state = (this.status.status !== 'on');
		this.power(state);
	}
}

module.exports = Plug;

