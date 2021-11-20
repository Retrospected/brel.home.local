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
    // Request of the get-devices query:
    // {"msgType": "GetDeviceList", "msgID": "20211120185942192"}

    const message = Buffer.from('{"msgType": "GetDeviceList", "msgID": "'+strftime("%Y%m%d%H%M%S%L", new Date())+'"}');
    let result = await this.send_and_receive(message);
    // Response of the get-devices query:
    // {"msgType":"GetDeviceListAck","mac":"<macaddress>","deviceType":"02000001","fwVersion":"A1.0.1_B0.1.4","ProtocolVersion":"0.9","token":"<token>","data":[{"mac":"<macaddress>","deviceType":"02000001"},{"mac":"<macaddress>","deviceType":"10000000"},{"mac":"<macaddress>","deviceType":"10000000"},{"mac":"<macaddress>","deviceType":"10000000"}]}

    return result;
  }

  /**
    BlindsTypes:
      ROLLER_BLINDS = 0
      VENETIAN_BLINDS = 1
      ROMAN_BLINDS = 2
      HONEYCOMB_BLINDS = 3
      SHANGRI_LA_BLINDS = 4
      ROLLER_SHUTTER = 5
      ROLLER_GATE = 6
      AWNING = 7
      TDBU = 8
      DAY_AND_NIGHT_BLINDS = 9
      DIMMING_BLINDS = 10
      CURTAIN = 11
      CURTAIN_LEFT = 12
      CURTAIN_RIGHT = 13

    Operations:
      CLOSING = 0
      OPENING = 1
      STOPPED = 2
      STATUS_QUERY = 5

    LimitState:
      NOT_LIMITED = 0
      TOP_LIMIT_DETECTED = 1
      BOTTOM_LIMIT_DETECTED = 2
      BOTH_LIMITS_DETECTED = 3
      THIRD_LIMIT_DETECTED = 4

    VoltageMode:
      AC_MOTOR = 0
      DC_MOTOR = 1

    WirelessMode
      UNIDIRECTIONAL = 0
      BIDIRECTIONAL = 1
      BIDIRECTIONAL_MECHANICAL_LIMITS = 2
      OTHER = 3

    currentPosition: 0 - 100
    targetPosition: 0 - 100

    Note: Homey considers the "open" state of Window Coverings as 1, where Brel sees open as 0. Homey considers closed as 0, where Brel sees closed as 100.
    Brel = (1-Homey)*100

  **/

  async windowcoverings_get (mac, deviceType) {
    // Request of the get-state query:
    // {"msgType": "ReadDevice", "mac": "<macaddress>", "deviceType": "10000000", "msgID": "20211120185429504", "AccessToken": "<AccessToken>"}
    //console.log("Getting state for: "+mac+" and deviceType: "+deviceType)

    const message = Buffer.from('{"msgType": "ReadDevice", "mac": "'+mac+'", "deviceType": "'+deviceType+'", "msgID": "'+strftime("%Y%m%d%H%M%S%L", new Date())+'", "AccessToken": "'+this.accesstoken+'"}');

    let state = await this.send_and_receive(message);
    // Response of the get-state query:
    // {"msgType":"ReadDeviceAck","mac":"<macaddress>","deviceType":"10000000","msgID":"20211120195744003","data":{"type":1,"operation":2,"currentPosition":7,"currentAngle":141,"currentState":3,"voltageMode":1,"batteryLevel":1245,"wirelessMode":1,"RSSI":-79}}

    return 1-JSON.parse(state)['data']['currentPosition']/100;
  }

  async windowcoverings_set (mac, deviceType, value) {
    // Request of the set-state query:
    // '{"msgType": "WriteDevice", "mac": "<macaddress>", "deviceType": "10000000", "data": {"targetPosition": 0-100}, "msgID": "20211120193237081", "AccessToken": "<AccessToken>"}'
    //console.log("Setting state for: "+mac+" and deviceType: "+deviceType+" to: "+value*100)

    const message = Buffer.from('{"msgType": "WriteDevice", "mac": "'+mac+'", "deviceType": "'+deviceType+'", "data": {"targetPosition": '+(1-value)*100+'}, "msgID": "'+strftime("%Y%m%d%H%M%S%L", new Date())+'", "AccessToken": "'+this.accesstoken+'"}');

    let state = await this.send_and_receive(message);
    // Request of the set-state query:
    // {"msgType":"WriteDeviceAck","mac":"<macaddress>","deviceType":"10000000","msgID":"20211120195632984","data":{"type":1,"operation":2,"currentPosition":0,"currentAngle":0,"currentState":3,"voltageMode":1,"batteryLevel":1245,"wirelessMode":1,"RSSI":-89}}}

    return "OK";
  }
};

module.exports = DeviceApi;
