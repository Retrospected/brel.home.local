'use strict';

const Homey = require('homey');

module.exports = [

  {
    method:         'POST',
    path:            '/add_bridge',
    requires_authorization: true,

    fn: function( args, callback ) {
      Homey.app.add_bridge( args.body.ip, args.body.key, callback );
    }
  },
  {
    method:         'GET',
    path:            '/status',
    requires_authorization: true,
    fn: function( args, callback ) {
      Homey.app.status(	Homey.ManagerSettings.get("ip"), Homey.ManagerSettings.get("key"), function (res) {
        callback(null, res)
      })
    }
  }
]
