'use strict';

const { privateEncrypt } = require('crypto');
const Homey = require('homey');

const DeviceApi = require('./drivers/device-api.js');


class BrelHomeLocal extends Homey.App {

	async onInit() {
		this.log('brel.home.local is running...');


		this.log('DEV MODE, cleaning up to simulate fresh start');
		this.homey.settings.set("ip", null);
		this.homey.settings.set("key", null);

		//testcode
		this.homey.settings.set("ip", "192.168.30.151");
		this.homey.settings.set("key", "abc");
		//const result = await this.connect(this.homey.settings.get("ip"), this.homey.settings.get("key"))
		//this.log(result);

		this.deviceapi = new DeviceApi(this.homey.settings.get("ip"), this.homey.settings.get("key"));
		this.log("DeviceApi initialized!")
		let results = await this.deviceapi.getDevices();
		this.log(results);
	}

	async add_bridge(ip, key) {
		this.log("Trying to add bridge with IP: "+ip+" KEY: "+key);
		const result = await this.status(ip, key);

		if (result === "OK") {
			this.homey.settings.set("ip", ip);
			this.homey.settings.set("key", key);
			this.log('Adding bridge succesful...');
			return "OK";
		}
		else {
			this.log('Adding bridge failed...');
			return "NOT OK";
		}
	}

	async status (ip, key) {
		this.log('Retrieving Brel Home Hub connection status...');
		if (ip != null && key != null) {
			this.log('Status check started for IP: '+ip+" KEY: "+key);

			let result = await this.connect(this.homey.settings.get("ip"), this.homey.settings.get("key"));
			this.log("CAme back with: "+result);
			if (result) {
				this.log(result);
				this.log ('Brel Home Hub connection OK');
				return "OK";
			}
		}
		this.log('Brel Home Hub connection NOT OK.');
		return "NOT OK";
	}


}

module.exports = BrelHomeLocal;
