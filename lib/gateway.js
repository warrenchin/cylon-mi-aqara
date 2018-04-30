/*jshint esversion: 6, -W116, -W035, -W016 */

const Subdevice = require('./subdevice');
const debug = require('./debuggers');

class Gateway extends Subdevice {
	constructor(opts) {
		super(opts);

		opts = opts || {};
		this.password = opts.password;
		this.heartbeatIntervalS = 10;

		Object.assign(this.commands, {
			play: this.play,
			stop: this.stop,
			doorbell: this.doorbell,
			rgb: this.rgb
		});

		this.events.push(
			'rgb', // {old: new: }
			'illumination' // {old: new: }
		);
	}

	// noinspection JSUnusedGlobalSymbols
	onmessage(msg) {
		if (msg.cmd !== 'heartbeat') debug.recv('[%s] %o', this.name, msg);

		if ('data' in msg) { // iam msg do not have data
			if ('rgb' in msg.data) this.status.rgb = msg.data.rgb;
			if ('illumination' in msg.data) this.status.illumination = msg.data.illumination;
		}

		if (msg.cmd === 'heartbeat') {
			// { cmd: 'heartbeat', model: 'gateway', sid: '286c07fa354a', short_id: '0', token: '8UDo7OfmMn1mRfHG', data: { ip: '192.168.1.50' } } +10s
		}
		else if (msg.cmd === 'report') {
			//   { cmd: 'report', model: 'gateway', sid: '286c07fa354a', short_id: 0, data: { rgb: 0, illumination: 479 } } +29s
		}
		else if (msg.cmd === 'read_ack') {
			// { cmd: 'read_ack', model: 'gateway', sid: '286c07fa354a', short_id: 0, data: { rgb: 16777215, illumination: 629, proto_version: '1.0.9' } } +1ms
		}
		else if (msg.cmd === 'write_ack') {
			// { cmd: 'write_ack', model: 'gateway', sid: '286c07fa354a', short_id: 0, data: { rgb: 0, illumination: 474, proto_version: '1.0.9' } } +3s
			debug.recv('read_ack %o', msg);
		}
		else if (msg.cmd === 'iam') {} // handled by aqara-interface
		else if (msg.cmd === 'get_id_list_ack') {} // handled by aqara-interface
		else return false;

		return true;
	}

	/**
	 * Play tone
	 *
	 * @param {Number} id tone id
	 * @return {void}
	 * @publish
	 */
	play(id) {
		this.device.write( { mid: id } );
	}

	/**
	 * Stop tone
	 *
	 * @return {void}
	 * @publish
	 */
	stop() {
		this.play(10000);
	}

	/**
	 * Play doorbell tone (id 10)
	 *
	 * @return {void}
	 * @publish
	 */
	doorbell() {
		this.play(10);
	}

	/**
	 * Sets the light's color via RGB
	 *
	 * @param {Number} brightness brightness (0-255)
	 * @param {Number} r red (0-255)
	 * @param {Number} g green (0-255)
	 * @param {Number} b blue (0-255)
	 * @return {void}
	 * @publish
	 */
	rgb(brightness, r, g, b) {
		let c = (brightness & 0xff) << 24 | (r & 0xff) << 16 | (g & 0xff) << 8 | (b & 0xff);
		this.device.write( { rgb: c } );
	}
}

module.exports = Gateway;



