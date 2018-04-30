/*jshint esversion: 6, -W116, -W035 */

const Subdevice = require('./subdevice');
const debug = require('./debuggers');

class WallSwitch extends Subdevice {
	constructor(opts) {
		super(opts);

		this.heartbeatIntervalS = 10 * 60; // 10 minutes

		this.channel = {
			0: opts.channel_0 || 'channel_0',
			1: opts.channel_1 || 'channel_1'
		};

		Object.assign(this.commands, {
			power: this.power,
			toggle: this.toggle
		});

		this.events.push (
			this.channel[0], // { old: new: on/off}
			this.channel[1]  // { old: new: on/off}
		);
	}

	// noinspection JSUnusedGlobalSymbols
	onmessage(msg) {
		debug.recv('[%s] %o', this.name, msg);

		if ('voltage' in msg.data) this.status.voltage = msg.data.voltage;
		if ('channel_0' in msg.data) this.status[this.channel[0]] = msg.data.channel_0;
		if ('channel_1' in msg.data) this.status[this.channel[1]] = msg.data.channel_1;

		if (msg.cmd === 'report') {
		}
		else if (msg.cmd === 'heartbeat') {
			// { cmd: 'heartbeat', model: 'ctrl_neutral2', sid: '158d0001f469fa', short_id: 2686, data: { voltage: 3300, channel_0: 'on', channel_1: 'off' } }
		}
		else if (msg.cmd === 'read_ack') {
			// { cmd: 'read_ack', model: 'ctrl_neutral2', sid: '158d00014cf97a', short_id: 26625, data: { voltage: 3300, channel_0: 'on', channel_1: 'on' } }
		}
		else if (msg.cmd === 'write_ack') {
			// { cmd: 'write_ack', model: 'ctrl_neutral2', sid: '158d0002234eb7', short_id: 7918, data: { voltage: 3300, channel_0: 'off', channel_1: 'off' } }
		}
		else return false;

		return true;
	}

	power(channel, state) {
		let channelId;
		if (typeof channel !== 'number') channelId = this._lookupChannel(channel);
		else channelId = channel;

		if (!!channelId) {
			let data = {
				['channel_' + channelId]: state ? 'on' : 'off'
			};

			this.device.write(data);
		}
		else console.error("Unknown channel:", channel);
	}

	toggle(channel) {
		let channelName;
		if (typeof channel === 'number') channelName = this.channel[channel];
		else channelName = channel;

		let state = (this.status[channelName] !== 'on');
		this.power(channelName, state);
	}

	_lookupChannel(name) {
		return Object.keys(this.channel).find(key => this.channel[key] === name);
	}
}

module.exports = WallSwitch;

