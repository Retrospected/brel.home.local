const dgram = require('dgram');
const buffer = require('buffer');

class DeviceApi {

  constructor (ip, key) {
    this.ip = ip;
    this.key = key;
    this.port = 32100;
    console.log("Initializing hub with IP: "+this.ip+" and KEY: "+this.key);
  }

  async getDevices () {
    console.log("Getting Devices from Device Api");
    this.client = dgram.createSocket("udp4");

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

    const message = Buffer.from('{"msgType": "GetDeviceList", "msgID": "20211115223426610"}');
    console.log("Sending message to: "+this.ip+":"+this.port)
    this.client.send(message, this.port, this.ip);
    this.isTimeout();

    console.log("Reaching the end");
    return null;
  }

  isTimeout () {
    this.timer = setTimeout(() => {
        console.log('udp request timeout');
        this.client.close();
    }, 5000)
  }
};

module.exports = DeviceApi;