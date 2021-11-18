const dgram = require('dgram');
const buffer = require('buffer');
const { Timer } = require('./utils');

class DeviceApi {
  timer = null

  constructor (ip, key) {
    this.ip = ip;
    this.key = key;
    this.port = 32100;
    console.log("Initializing hub with IP: "+this.ip+" and KEY: "+this.key);
  }

  async getDevices () {
    this.timer = Timer(5000)

    console.log("Getting Devices from Device Api");
    this.client = dgram.createSocket("udp4");

    this.client.on('error', (err) => {
        console.log(`client err：\n${ err.stack }`);
        this.client.close();
    });

    this.client.on('message', msg => {
        this.timer.abort();
        console.log("result: ", msg.toString());
        this.client.close();
        return msg.toString();
    });

    const message = Buffer.from('{"msgType": "GetDeviceList", "msgID": "20211115223426610"}');
    console.log("Sending message to: "+this.ip+":"+this.port)
    this.client.send(message, this.port, this.ip);

    // Start timer and wait until is finished
    await this.timer.start()

    console.log('udp request timeout');
    this.client.close();

    console.log("Reaching the end");
    return null;
  }
};

module.exports = DeviceApi;