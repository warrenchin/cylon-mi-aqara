/*jshint esversion: 6, -W116, -W035 */

const EventEmitter = require('events');
const dgram = require('dgram');
const crypto = require('crypto');
const debug = require('./debuggers');

const config = {
	iv: Buffer.from([0x17, 0x99, 0x6d, 0x09, 0x3d, 0x28, 0xdd, 0xb3, 0xba, 0x69, 0x5a, 0x2e, 0x6f, 0x58, 0x56, 0x2e]),
	multicastAddress: '224.0.0.50',
	multicastPort: 4321,
	serverPort: 9898
};

// interface -+- gateway 1 -+- device1
//            |             +- device2
//            +- gateway 2 --- device3

class AqaraInterface extends EventEmitter {

	constructor () {
		super();
		this.devices = {};
	}

	start() {
		this._createSocket();
		this._initServerSocket();
		this.whois();

		this.emit('ready');
	}

	_createSocket () {
		this.serverSocket = dgram.createSocket({
			type: 'udp4',
			reuseAddr: true
		});
	}

	_initServerSocket () {
		let serverSocket = this.serverSocket;

		serverSocket.on('error', function(err){
			console.error('ERROR msg: %s, stack: %s\n', err.message, err.stack);
		});

		serverSocket.on('listening', function(){
			debug.info(`server listening on port ${config.serverPort}.`);
			serverSocket.addMembership(config.multicastAddress);
		});

		serverSocket.on('message', this._parseMessage.bind(this));

		serverSocket.bind(config.serverPort);
	}

	_parseMessage(raw) {
		let msg;

		try {
			msg = JSON.parse(raw); // msg is a Buffer
			if (msg.hasOwnProperty('data')) msg.data = JSON.parse(msg.data);
		} catch (e) {
			console.error('Bad message: %s', raw);
			return;
		}

		debug.raw('%o', msg);

		if (msg.cmd === 'iam') {
			debug.recv('%o', msg);

			let sid = msg.sid;
			if (!(sid in this.devices)) {
				this.devices[sid] = new Gateway(this, sid);
			}

			this.devices[sid].ip = msg.ip;
			this.devices[sid].port = msg.port;
			this.devices[sid].model = msg.model;
			this.devices[sid].proto_version = msg.proto_version;

			this.devices[sid].emit('message', msg);
		}
		else {
			let target = this._getDevice(msg.sid);
			if (!!target) target.emit('message', msg);
			else debug.info('unknown target for msg %o', msg);
		}
	}

	_getDevice(sid) {
		if (sid in this.devices) return this.devices[sid];
		for (let key in this.devices) {
			if (sid in this.devices[key].devices) return this.devices[key].devices[sid];
		}

		return null;
	}

	async getDevice(sid, timeoutms) { // jshint ignore:line
		return new Promise((resolve, reject) => {
			let check = () => {
				let device = this._getDevice(sid);
				if (!!device) resolve(device);
				else {
					if ((timeoutms -= 500) < 0) reject('getDevice timeout');
					else setTimeout(check, 500);
				}
			};

			setTimeout(check, 500);
		});
	}

	send(ip, port, msg) {
		debug.send('%s:%d %o', ip, port, msg);

		let msgStr = this._messageStringify(msg);
		this.serverSocket.send(msgStr, 0, msgStr.length, port, ip);
	}

	broadcast(msg) {
		this.send(config.multicastAddress, config.multicastPort, msg);
	}

	whois() {
		this.broadcast( { cmd: 'whois' } );
	}

	_isObject(obj) {
		return obj && Object.prototype.toString.apply(obj) === '[object Object]';
	}

	_messageStringify(msg) {
		try {
			let msgData = Object.assign({}, msg);
			if (this._isObject(msgData.data)) {
				msgData.data = JSON.stringify(msgData.data);
			}
			return JSON.stringify(msgData);
		} catch (e) {
			console.error('[_messageStringify] Bad msg!', msg);
			return '{}';
		}
	}
}

class Gateway extends EventEmitter {

	constructor(aqaraInterface, sid) {
		super();
		this.aqaraInterface = aqaraInterface;
		this.sid = sid;

		this.password = null;

		this.token = null;
		this.ip = null;
		this.port = null;
		
		this.model = null;
		this.proto_version = null;

		this.devices = {};

		this.on('message', function(msg) {
			if (msg.sid === this.sid) {
				let cmd = msg.cmd;

				if ('token' in msg) this.token = msg.token;

				if (cmd === 'iam') { // whois callback
					// { cmd: 'iam', port: '9898', sid: '286c07fa354a', model: 'gateway', proto_version: '1.0.9', ip: '192.168.1.50' }
					this.ip = msg.ip;
					this.port = msg.port;
					this.model = msg.model;
					this.proto_version = msg.proto_version;
				}
				else if (cmd === 'get_id_list_ack') { // get_id_list callback
					// { cmd: 'get_id_list_ack', sid: '286c07fa354a', token: 'htu2Oxr308pWcUGP', data: [ '', '' ]

					for (let sid of msg.data) {
						this.devices[sid] = new Device(this, sid);
					}

					this.emit('ready');
				}
			}
			else {
				let device = this.devices[msg.sid];
				if (!!device) device.emit('message', msg);
				else debug.info('unknown device target for msg %o', msg);
			}
		});
	}

	toString() {
		return JSON.stringify(
			{ sid: this.sid, model: this.model, ip: this.ip, port: this.port }
		);
	}

	init() {
		this.get_id_list();
	}

	get_id_list() {
		this.send( { cmd: 'get_id_list' }  );
	}

	send(msg) {
		this.aqaraInterface.send(this.ip, this.port, msg);
	}

	write(data, target) {
		if (!target) target = this;

		let msg = {
			cmd: 'write',
			// model: target.model,
			sid: target.sid,
			data: Object.assign({}, data)
		};

		msg.data.key = this._cipher(this.token, this.password, config.iv);
		this.send(msg);
	}

	 _cipher(token, password, iv) {
		let cipher = crypto.createCipheriv('aes-128-cbc', password, iv);
		let key = cipher.update(token, "ascii", "hex");
		cipher.final('hex');
		return key;
	}
}

class Device extends EventEmitter {

	constructor(gateway, sid) {
		super();
		this.gateway = gateway;
		this.sid = sid;

		this.model = null;
		this.short_id = null;

		this.on('message', function(msg) {
			if (!this.subscribed) debug.info('[%s] %o', this.sid, msg);

			if ('model' in msg) this.model = msg.model;
			if ('short_id' in msg) this.short_id = msg.short_id;

			if (msg.cmd === 'read_ack') {
				this.emit('ready');
			}
		});
	}

	toString() {
		return JSON.stringify(
				{ sid: this.sid, model: this.model }
			);
	}

	init() {
		this.subscribed = true;
		this.read();
	}

	read() {
		this.send( {cmd: 'read', sid: this.sid} );
	}

	send(msg) {
		this.gateway.send(msg);
	}

	write(data) {
		this.gateway.write(data, this);
	}
}

module.exports = AqaraInterface;