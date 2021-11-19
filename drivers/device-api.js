const dgram = require('dgram');
const buffer = require('buffer');
const strftime = require('strftime');
const { Timer } = require('./utils');

class DeviceApi {
  constructor (ip, key, token) {
    this.ip = ip;
    this.key = key;
    this.port = 32100;
    console.log("Initializing DeviceApi with IP: "+this.ip+" and KEY: "+this.key);
    if (token) {
      console.log("And token: "+token);
      this.token = token;
    }
  }

  async send_and_receive(message) {
    return new Promise(async resolve => {
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
        console.log("<==========================================")
        this.timer.abort();
        this.client.close();
        resolve(msg.toString());
      });
      console.log("==========================================>")
      console.log("Sending message to: "+this.ip+":"+this.port)
      console.log("==========================================>")
      console.log(message.toString())
      console.log("===========================================")
      this.client.send(message, this.port, this.ip);
    });
  }

  async getToken () {
    console.log("Getting Token from Device Api");

    const message = Buffer.from('{"msgType": "GetDeviceList", "msgID": "'+strftime("%Y%m%d%H%M%S%L", new Date())+'"}');
    let result = await this.send_and_receive(message);

    return JSON.parse(result)['token'];
  }

  async getDevices () {
    console.log("Getting Devices from Device Api");

    const message = Buffer.from('{"msgType": "GetDeviceList", "msgID": "'+strftime("%Y%m%d%H%M%S%L", new Date())+'"}');
    let result = await this.send_and_receive(message);

    return result;
  }

  async windowcoverings_get (mac, deviceType) {
    //'{"msgType": "ReadDevice", "mac": "f4cfa24cf2a40002", "deviceType": "10000000", "msgID": "20211119003439473", "AccessToken": "<ACCESSTOKEN>"}'
    console.log("Getting state for: "+mac+" and deviceType: "+deviceType)
    return 1;
  }

  async windowcoverings_set (mac, deviceType, value) {
    // unknown yet
    console.log("Setting state for: "+mac+" and deviceType: "+deviceType+" to: "+value)
    return "OK";
  }
};

module.exports = DeviceApi;
