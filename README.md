# cylon-mi-aqara

Cylon.js (http://cylonjs.com) is a JavaScript framework for robotics, physical computing, and the Internet of Things (IoT).

This repository contains the Cylon adaptor for Xiaomi Aqara platform (https://www.mi.com/special/smart/), supports Gateway and a handful of zigbee based accessories.

## How to Use

```
npm install cylon cylon-mi-aqara
```

## Sample

```javascript
const Cylon = require("cylon");

Cylon.robot({
	name: "caprica6",

	connections: {
		aqara: { adaptor: 'mi-aqara' }
	},

	devices: {
		gateway: { driver: 'gateway', sid: '286c07fa354f', password: '????????????????' },

		btn1: { driver: 'switch', sid: '158d0001a5e2f9' },
		btn_doorbell: { driver: 'switch', sid: '158d0000f524b7' },
		btn_study_fan: { driver: 'switch', sid: '158d00016c08f5' },

		sw_living: { driver: 'switch', sid: '158d00012ef74a', channel_0: 'left', channel_1: 'right' },

		sensor_ht_living: { driver: 'sensor_ht', sid: '158d0000f4370c' },
		sensor_ht_storage: { driver: 'sensor_ht', sid: '158d0000f43717' },

		motion_gf_washroom: { driver: 'motion', sid: '158d0000f085ee' },
		motion_stair_lower: { driver: 'motion', sid: '158d0001209e4c' },

		magnet_entrance_door: { driver: 'magnet', sid: '158d0000d619b5' },

		outlet_study_fan: { driver: 'plug', sid: '158d0000f85465' },

		wallswitch_kitchen: { driver: 'wallswitch', sid: '158d0001f469fa', channel_0: 'kitchen_light', channel_1: 'wet_kitchen_light' },

		waterleak_kitchen: { driver: 'waterleak', sid: '158d0001d779c6' }
	},

	work: function(my) {
		my.btn_study_fan.on('click', () => my.outlet_study_fan.toggle());
		my.btn_study_fan.on('long_click_press', () => my.outlet_study_fan.power(false));

		my.btn1.on('long_click_press', () => my.wallswitch_kitchen.power('kitchen_light', false));

		my.gateway.on('illumination', (value) => {
			console.log('illumination changed from %d to %d', value.old, value.new);
		});
	}
}).start();
```
## Events

```
commons
'last_seen', // { old: new: datetime}
'online' // { old: new: true/false}
    
gateway
'rgb', // {old: new: }
'illumination' // {old: new:}
      
magnet
'status', // {old: new: open/close}
'last_open', // {old: new: datetime}
'last_close' // { old: new: datetime}
      
motion
'motion', // { old: true/false, new: true/false }
'no_motion', // {old: new: 120/180/300/600/1200/... }
'last_motion', // { old: datetime, new: datetime }
'voltage', // { old, new }
'lux' // { old, new }
      
plug
'voltage', // { old: new: }
'status', // { old: new: on/off }
'inused', // { old: new: 0/1 }
'power_consumed', // { old: new: kwh }
'load_power' // { old new: w }
      
sensor_ht
'humidity',  // { old: new: }
'temperature', // { old: new: }
'pressure', // { old: new: }
'voltage' // { old: new: }
      
switch
'click',
'double_click',
'long_click_press',
'long_click_release',
this.channel[0] + '_click',
this.channel[1] + '_click',
'dual_channel_click',
'voltage' // { old: new: }
      
wallswitch
this.channel[0], // { old: new: on/off}
this.channel[1]  // { old: new: on/off}
      
 waterleak
'leak', // { old, new: true/false }
'voltage' // { old, new }
```

## commands
```
gateway
play(toneid)
stop()
doorbell() // =play(10)
rgb(brigtness, red, green, blue)
      
plug
power(state) // boolean
toggle()
      
wallswitch
power(state) // boolean
toggle()
```
