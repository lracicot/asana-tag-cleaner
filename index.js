#!/usr/bin/env node

var config = require('./config');

var asana = require('asana');

var accessToken = process.env.ASANA_ACCESS_TOKEN;
var workspaceId = process.env.ASANA_WORKSPACE_ID;

var client = asana.Client.create().useAccessToken(accessToken);


client.users.me().then(function(me) {

	console.log("Hello " + me.name);

	return client.tags.findByWorkspace(workspaceId);
})
.then(function(response) {
    // There may be more pages of data, we could stream or return a promise
    // to request those here - for now, let's just return the first page
    // of items.
    return response.data;
 })
.map(function(tags) {
	console.log(tags);
});