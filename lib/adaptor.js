const Cylon = require('cylon');
const AqaraInterface = require('./aqara-interface');
const debug = require('./debuggers');

const Adaptor = module.exports = function Adaptor(opts) {
	Adaptor.__super__.constructor.apply(this, arguments);
	opts = opts || {};

	this.sid = opts.sid;
	this.password = opts.password;
};

Cylon.Utils.subclass(Adaptor, Cylon.Adaptor);

Adaptor.prototype.connect = function (callback) {

	this.aqara = new AqaraInterface();

	this.aqara.on('ready', () => {
		debug.info('%s ready', this.name);
		callback();
	});

	this.aqara.on('message', function (msg) {
		this.emit("message", msg);
	}.bind(this));

	this.aqara.start();
};

Adaptor.prototype.disconnect = function (callback) {
	callback();
};

Adaptor.prototype.getDevice = function (sid) {
	return this.aqara.getDevice(sid);
};

Adaptor.prototype.send = function (msg) {
	this.aqara.send(msg);
};

Adaptor.prototype.write = function (msg) {
	this.aqara.write(msg);
};

