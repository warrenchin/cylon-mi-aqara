/*jshint esversion: 6, -W116, -W035 */

const Cylon = require("cylon");
const debug = require('./debuggers');

class Subdevice extends Cylon.Driver {
	constructor(opts) {
		super(opts);

		opts = opts || {};
		this.sid = opts.sid;

		// Include a list of commands that will be made available to external APIs.
		this.commands = {
			// This is how you register a command function for the API;
			// the command should be added to the prototype, see below.
			read: this.read
		};

		this.events = [
			'last_seen', // { old: new: datetime }
			'online' // { old: new: true/false}
		];

		this.device = null;

		const _this = this;
		this.status = new Proxy({}, {
			set(target, key, value) {
				if (target[key] !== value) {
					_this._emit(key, { old: target[key], new: value});
					target[key] = value;
				}

				return true;
			}
		});

		this.status.online = false;
	}

	async start(callback) { // jshint ignore:line
		this.timeoutReady = setTimeout(() => {

			if (!!this.device) { // no response from device
				console.log('timeout getting response from %s, retrying', this.name);
				this.device.init(); // attempt to re-init
			}
			else { // device not found in gateway
				console.error('%s sid: %s not found in gateway', this.name, this.sid);
				this.connection.aqara.whois(); // attempt to re-init and forget
				callback();
			}

		}, 5000);

		try {
			this.device = await this.connection.getDevice(this.sid, 5000); // jshint ignore:line

			this.device.on('ready', () => {
				console.log('%s sid: %s ready', this.name, this.sid);
				clearTimeout(this.timeoutReady);
				callback();
			});

			this.device.on("message", (msg) => {
				// debug.recv('[%s] %o', this.name, msg);
				this.updateOnlineStatus();

				if (msg.cmd === 'report') this._emit('report');

				if (!this.onmessage(msg)) {
					debug.recv("[%s] Unhandled: %o", this.name, msg);
				}
			});

			if ('password' in this) this.device.password = this.password;
			this.device.init();

		} catch (e) {
			console.error('ERROR %s %s', this.name, e.toString());
		}
	}

	// noinspection JSUnusedGlobalSymbols
	halt(callback) {
		callback();
	}

	_emit(event, data) {
		if (event !== 'last_seen') debug.event('[ %s ] %s %o', this.name, event, data);
		this.emit(event, data);
	}

	updateOnlineStatus() {
		this.status.online = true;
		this.status.last_seen =  Date.now();

		if (!this.heartbeatIntervalS) {
			console.error('heartbeatIntervalS not set for %s', this.name);
			return;
		}

		clearTimeout(this.timeoutHeartbeat);

		let timeoutMS = (this.heartbeatIntervalS + 5) * 1000;
		this.timeoutHeartbeat = setTimeout(() => {
			this.status.online = false;
		}, timeoutMS);
	}
}

module.exports = Subdevice;

