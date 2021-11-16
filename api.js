module.exports = {
  async getStatus ({ homey, query }) {
    const result = await homey.app.status(homey.settings.get("ip"),homey.settings.get("key"));
    return result;
  },

  async addBridge ({ homey, body }) {
    const addBridgeResult = await homey.app.add_bridge( body.ip, body.key );
    return addBridgeResult;
  },

  async ip ({ homey }) {
    return homey.settings.get("ip");
  },

  async key ({ homey }) {
    return homey.settings.get("key");
  }
}