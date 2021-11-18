'use strict';

const { Driver } = require('homey');
const DeviceApi = require('../device-api.js');

const deviceType = "10000000";

class RollerBlindsDriver extends Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
		this.deviceapi = new DeviceApi(this.homey.settings.get("ip"), this.homey.settings.get("key"));
    this.log('MyDriver has been initialized');
  }

  /**
   * onPairListDevices is called when a user is adding a device
   * and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    let result = await this.deviceapi.getDevices();
    let devices = []
    JSON.parse(result)['data'].forEach(function(item) {
      if (item["deviceType"] === deviceType) {
       devices.push({ name: 'rollerblind-'+item['mac'].substr(item['mac'].length-8,8), data: { id: item['mac'], deviceType: item["deviceType"] }})
      }
    })
    return devices;
  }
}

module.exports = RollerBlindsDriver;
