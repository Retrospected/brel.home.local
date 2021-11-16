'use strict';

const { privateEncrypt } = require('crypto');
const Homey = require('homey');

const dgram = require('dgram');
const buffer = require('buffer');


class BrelHomeLocal extends Homey.App {

	async onInit() {
		this.log('brel.home.local is running...');
		
		this.log('DEV MODE, cleaning up to simulate fresh start');
		this.homey.settings.set("ip", null);
		this.homey.settings.set("key", null);

		//testcode
		this.homey.settings.set("ip", "192.168.30.151");
		this.homey.settings.set("key", "abc");
		const result = await this.connect(this.homey.settings.get("ip"), this.homey.settings.get("key"))
		this.log(result);
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

			const result = await this.connect(this.homey.settings.get("ip"), this.homey.settings.get("key"));

			if (result) {
				this.log(result);
				this.log ('Brel Home Hub connection OK');
				return "OK";
			}
		}
		this.log('Brel Home Hub connection NOT OK.');
		return "NOT OK";
	}

	async connect (ip, key) {
        this.log("Initializing hub with IP: "+ip+" and KEY: "+key);
        this.ip = ip;
        this.port = 32100;
        this.key = key;
        this.client = dgram.createSocket('udp4');

        this.client.on('error', (err) => {
            console.log(`client err：\n${ err.stack }`);
            this.client.close();
        });
            
		this.client.on('message', msg => {
            clearTimeout(this.timer);
            console.log("result: ", msg.toString());
            this.client.close();
            return msg.toString();
        });

		this.getDevices();
    }

    isTimeout () {
        this.timer = setTimeout(() => {
            console.log('udp request timeout');
            this.client.close();
        }, 1000)
    }
    
    getDevices () {
        const message = Buffer.from('{"msgType": "GetDeviceList", "msgID": "20211115223426610"}');
        this.log("Sending message to: "+this.ip+":"+this.port)
		this.client.send(message, this.port, this.ip);
        this.isTimeout();
    }
}

module.exports = BrelHomeLocal;