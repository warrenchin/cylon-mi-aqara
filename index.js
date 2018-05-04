"use strict";

const Adaptor = require("./lib/adaptor");

const Drivers = {
  'mi-aqara.gateway': require('./lib/gateway'),
  'mi-aqara.switch': require('./lib/switch'),
  'mi-aqara.sensor_ht': require('./lib/sensor_ht'),
  'mi-aqara.motion': require('./lib/motion'),
  'mi-aqara.magnet': require('./lib/magnet'),
  'mi-aqara.plug': require('./lib/plug'),
  'mi-aqara.wallswitch': require('./lib/wallswitch'),
  'mi-aqara.waterleak': require('./lib/waterleak')
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
