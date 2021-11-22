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

    var ip = this.homey.settings.get("ip");
    var key = this.homey.settings.get("key");

    this.paused = false;
    this.deviceapi = new DeviceApi(ip, key);
    await this.deviceapi.authenticate()

    this.registerCapabilityListener('windowcoverings_set', async (value) => {
      this.log('State set: ',value)
      this.deviceapi.windowcoverings_set(this.getData()['id'],this.getData()['deviceType'], value)
      this.paused = true;
      const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));
      await waitFor(10000);
      this.paused = false;
    });

    setInterval(() => {
      if (!this.paused) {
        this.deviceapi.windowcoverings_get(this.getData()['id'],this.getData()['deviceType'])
        .then((result) => {
          this.setAvailable();
          this.setCapabilityValue('windowcoverings_set', result).catch(this.error);
        })
        .catch((error) => {
          this.setUnavailable('Could not connect to the Brel Home Hub').catch(error)
        });
      } else {
        this.log('Paused')
      }
    }, 3000);
  }

  async updateSettings() {
    this.deviceapi.updateSettings(this.homey.settings.get("ip"), this.homey.settings.get("key"));
    this.deviceapi.authenticate();
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
