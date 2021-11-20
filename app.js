'use strict';

const { privateEncrypt } = require('crypto');
const Homey = require('homey');

const DeviceApi = require('./drivers/device-api.js');


class BrelHomeLocal extends Homey.App {

	async onInit() {
		this.log('brel.home.local is running...');

		//this.log('DEV MODE, cleaning up to simulate fresh start');
		//this.homey.settings.set("ip", null);
		//this.homey.settings.set("key", null);
	}

	async add_hub(ip, key) {
		this.log("Trying to add hub with IP: "+ip+" KEY: "+key);
		const result = await this.status(ip, key);

		if (result === "OK") {
			this.homey.settings.set("ip", ip);
			this.homey.settings.set("key", key);

			this.log('Adding hub succesful...');
			return "OK";
		}
		else {
			this.log('Adding hub failed...');
			return "NOT OK";
		}
	}

	async status (ip, key) {
		this.log('Retrieving Brel Home Hub connection status...');
		if (ip && key) {
			this.log('Status check started for IP: '+ip+" KEY: "+key);

			this.deviceapi = new DeviceApi(ip, key);
			let result = await this.deviceapi.authenticate();
			this.log("Came back with: "+result);
			if (result === "OK") {
				this.log ('Brel Home Hub connection OK');

				for (const driver in this.homey.drivers.getDrivers())
				{
					const devices = this.homey.drivers.getDriver(driver).getDevices();

					devices.forEach((device) => {
						device.updateSettings();
					});

				}
			
				return "OK";
			}
			else {
				return result
			}
		}
		this.log('No IP or KEY configured in settings.');
		return "empty_config";
	}
}

module.exports = BrelHomeLocal;
