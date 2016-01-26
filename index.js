#!/usr/bin/env node

var config = require('./config');

console.log(config);

var asana = require('asana');
var client = asana.Client.create().useAccessToken(config.asana.access_token);
client.users.me().then(function(me) {
  console.log(me);
});
