const dgram = require('dgram');
const buffer = require('buffer');
const strftime = require('strftime');
const { Timer } = require('./utils');
const crypto = require('crypto');

class DeviceApi {
  constructor (ip, key) {
    this.ip = ip;
    this.key = key;
    this.port = 32100;
    console.log("Initializing DeviceApi with IP: "+this.ip+" and KEY: "+this.key);
  }

  updateSettings(ip, key){
    this.ip = ip;
    this.key = key;
  }

  async authenticate() {
    return new Promise(async resolve => {
       this.getToken()
      .then((token) => {
        this.token = token;
        console.log("Retrieved token: "+this.token)
        this.getAccessToken(this.key, this.token)
        .then((AccessToken) => {
          this.accesstoken = AccessToken;
          console.log("Generated AccessToken: "+this.accesstoken)
          resolve("OK");
        })
        .catch((error) => {
          console.log("Getting AccessToken failed")
          resolve("key_failed");
        })
      })
      .catch((error) => {
        console.log("Connection failed");
        resolve("connection_failed");
      })
    });
  }
  async getAccessToken(key, token) {
    console.log("Creating AccessToken using: "+key+" and: "+token)
    let cipher = crypto.createCipheriv("aes-128-ecb", key, '')
    cipher.setAutoPadding(false)
    let result = cipher.update(token).toString('hex');
    result += cipher.final().toString('hex');
    return result.toUpperCase();
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

      this.client.on('error', error => {
        console.log("socket error");
        resolve(error.toString());
      })
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

    console.log("Getting state for: "+mac+" and deviceType: "+deviceType)

    const message = Buffer.from('{"msgType": "ReadDevice", "mac": "'+mac+'", "deviceType": "'+deviceType+'", "msgID": "'+strftime("%Y%m%d%H%M%S%L", new Date())+'", "AccessToken": "'+this.accesstoken+'"}');
    
    let state = await this.send_and_receive(message);

    return JSON.parse(state)['data']['currentPosition']/100;
  }

  async windowcoverings_set (mac, deviceType, value) {
    // unknown
    console.log("Setting state for: "+mac+" and deviceType: "+deviceType+" to: "+value)
    return "OK";
  }
};

module.exports = DeviceApi;
