"use strict";

const Adaptor = require("./lib/adaptor");

const Drivers = {
	'gateway': require('./lib/gateway'),
	'switch': require('./lib/switch'),
	'sensor_ht': require('./lib/sensor_ht'),
	'motion': require('./lib/motion'),
	'magnet': require('./lib/magnet'),
	'plug': require('./lib/plug'),
	'wallswitch': require('./lib/wallswitch'),
	'waterleak': require('./lib/waterleak')
};

module.exports = {
	// Adaptors your module provides, e.g. ["spark"]
	adaptors: ["mi-aqara"],
	drivers: Object.keys(Drivers),

	// Modules intended to be used with yours, e.g. ["cylon-gpio"]
	dependencies: [],

	adaptor: function (opts) {
		return new Adaptor(opts);
	},

	driver: function (opts) {
		opts = opts || {};

		if (Drivers[opts.driver]) {
			return new Drivers[opts.driver](opts);
		}

		return null;
	}
};
