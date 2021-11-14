'use strict';

const Homey = require('homey');

class BrelHomeLocal extends Homey.App {

	async onInit() {
		this.log('brel.home.local is running...');
	}

	add_bridge(ip, key, callback) {
		//TODO implement test to create object based on breljs library
		this.status(ip, key, function (res) {
			if (res = "OK") {
				this.log('Bridge added succesful...');
				Homey.ManagerSettings.set("ip", ip)
				Homey.ManagerSettings.set("key", key)
				callback("OK")
			}
			else if (res = "NOT OK"){
				this.log('Bridge added failed...');
				callback("NOT OK")
			}
		});
	}

	status (ip, key, callback) {
		//TEST connectivity and then:
		this.log('Status check started');

		callback("OK");

		callback("NOT OK");

	}
}

module.exports = BrelHomeLocal;
