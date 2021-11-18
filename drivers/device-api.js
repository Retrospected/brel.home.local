const dgram = require('dgram');
const buffer = require('buffer');
const { Timer } = require('./utils');

class DeviceApi {
  constructor (ip, key) {
    this.ip = ip;
    this.key = key;
    this.port = 32100;
    console.log("Initializing hub with IP: "+this.ip+" and KEY: "+this.key);
  }

  async getDevices () {
    return new Promise(async resolve => {
      console.log("Getting Devices from Device Api");
      this.client = dgram.createSocket("udp4");
      this.timer = Timer(5000);

      this.timer.start().then(() => {
        // Timeout after 5 seconds
        console.log('udp request timeout');
        this.client.close();
        resolve(null);
      });

      this.client.on('error', (err) => {
        console.log(`client err：\n${ err.stack }`);
        this.timer.abort();
        this.client.close();
        resolve(null);
      });

      this.client.on('message', msg => {
        console.log("result: ", msg.toString());
        this.timer.abort();
        this.client.close();
        resolve(msg.toString());
      });

      const message = Buffer.from('{"msgType": "GetDeviceList", "msgID": "20211115223426610"}');
      console.log("Sending message to: "+this.ip+":"+this.port)
      this.client.send(message, this.port, this.ip);
    });
  }
};

module.exports = DeviceApi;