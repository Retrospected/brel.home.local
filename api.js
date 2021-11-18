module.exports = {
  async getStatus ({ homey, query }) {
    const result = await homey.app.status(homey.settings.get("ip"),homey.settings.get("key"));
    return result;
  },

  async addHub ({ homey, body }) {
    const addHubResult = await homey.app.add_hub( body.ip, body.key );
    return addHubResult;
  },

  async ip ({ homey }) {
    return homey.settings.get("ip");
  },

  async key ({ homey }) {
    return homey.settings.get("key");
  }
}
