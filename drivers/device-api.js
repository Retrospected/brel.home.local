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
    var result = null
    this.timer = Timer(500)

    console.log("Getting Devices from Device Api");
    this.client = dgram.createSocket("udp4");

    this.client.on('error', (err) => {
        console.log(`client err：\n${ err.stack }`);
        this.client.close();
    });

    this.client.on('message', msg => {
        console.log("result: ", msg.toString());
        result = msg.toString();
    });

    const message = Buffer.from('{"msgType": "GetDeviceList", "msgID": "20211115223426610"}');
    console.log("Sending message to: "+this.ip+":"+this.port)
    this.client.send(message, this.port, this.ip);

    for(var i = 0; i < 10; i++) {
      await this.timer.start()

      if (result) {
        this.client.close();
        return result
      }
    }

    console.log('udp request timeout');
    this.client.close();
    return result;
  }
};

module.exports = DeviceApi;