#!/usr/bin/env node

console.log('hello world');
var asana = require('asana');
var client = asana.Client.create().useAccessToken('my_access_token');
client.users.me().then(function(me) {
  console.log(me);
});
