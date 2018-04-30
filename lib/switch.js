/*jshint esversion: 6, -W116, -W035 */

const Subdevice = require('./subdevice');
const debug = require('./debuggers');

class Switch extends Subdevice {
	constructor(opts) {
		super(opts);

		this.heartbeatIntervalS = 60 * 60; // 1 hr

		this.channel = {
			0: opts.channel_0 || 'channel_0',
			1: opts.channel_1 || 'channel_1'
		};

		Object.assign(this.commands, {

		});

		this.events.push (
			'click',
			'double_click',
			'long_click_press',
			'long_click_release',
			this.channel[0] + '_click',
			this.channel[1] + '_click',
			'dual_channel_click',
			'voltage' // { old: new: }
		);
	}

	// noinspection JSUnusedGlobalSymbols
	onmessage(msg) {
		debug.recv('[%s] %o', this.name, msg);

		if ('voltage' in msg.data) {
			this.status.voltage = msg.data.voltage;
		}

		if (msg.cmd === 'report') {
			// { cmd: 'report', model: '86sw2', sid: '158d000128f74a', short_id: 52045, data: { channel_0: 'click' } } +47s
			// { cmd: 'report', model: '86sw2', sid: '158d000128f74a', short_id: 52045, data: { channel_1: 'click' } } +307ms
			// { cmd: 'report', model: '86sw2', sid: '158d000128f74a', short_id: 52045, data: { dual_channel: 'both_click' } } +306ms

			let event = null;
			if ('status' in msg.data) event = msg.data.status;
			if ('channel_0' in msg.data) event = this.channel[0] + '_' + msg.data.channel_0;
			if ('channel_1' in msg.data) event = this.channel[1] + '_' + msg.data.channel_1;

			if (!!event) this._emit(event);
			else debug.recv('unhandled report: %o', msg);
		}

		else if (msg.cmd === 'heartbeat') {
			// { cmd: 'heartbeat', model: 'switch', sid: '158d0000f6c1f0', short_id: 64616, data: { voltage: 3042 } }
		}
		else if (msg.cmd === 'read_ack') {
			// { cmd: 'read_ack', model: 'switch', sid: '158d0000d524b7', short_id: 48189, data: { voltage: 3062 } }
			// { cmd: 'read_ack', model: '86sw2', sid: '158d000128f74a', short_id: 52045, data: { voltage: 3075 } }
		}
		else {
			return false;
		}

		return true;
	}
}

module.exports = Switch;
