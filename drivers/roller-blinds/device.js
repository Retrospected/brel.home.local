'use strict';

const { Device } = require('homey');

const DeviceApi = require('../device-api.js');

class RollerBlindsDevice extends Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log("Device init");
    this.log("Name:", this.getName());
    this.log("Class:", this.getClass());
    this.log("MAC:", this.getData()['id']);
    this.log("deviceType:", this.getData()['deviceType']);

    this.deviceapi = new DeviceApi(this.homey.settings.get("ip"), this.homey.settings.get("key"));

    this.registerCapabilityListener('windowcoverings_set', async (value) => {
      this.log('State set: ',value)
      this.deviceapi.windowcoverings_set(this.getData()['id'],this.getData()['deviceType'], value)
    });

    setInterval(() => {
      this.log("Pulling state of the blind in this function")

      this.deviceapi.windowcoverings_get(this.getData()['id'],this.getData()['deviceType'])
      .then((result) => {
        this.setCapabilityValue('windowcoverings_set', result).catch(this.error);
      })
      .catch((error) => {
        this.setUnavailable('Could not connect to the Brel Home Hub').catch(error)
      });

    }, 3000);
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('MyDevice settings where changed');
    this.log(oldSettings);
    this.log(newSettings);
    this.log(changedKeys);
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('MyDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyDevice has been deleted');
  }

}

module.exports = RollerBlindsDevice;
