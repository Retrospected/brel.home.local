'use strict';

const Homey = require('homey');

class BrelHomeLocal extends Homey.App {

	async onInit() {
		this.log('brel.home.local is running...');
		
		this.log('DEV MODE, cleaning up to simulate fresh start');
		this.homey.settings.set("ip", null);
		this.homey.settings.set("key", null);
	}

	async add_bridge(ip, key) {
		//TODO implement test to create object based on breljs library
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
			
			this.log ('Brel Home Hub connection OK');
			return "OK";
		}
		this.log('Brel Home Hub connection NOT OK.');
		return "NOT OK";
	}
}

module.exports = BrelHomeLocal;
