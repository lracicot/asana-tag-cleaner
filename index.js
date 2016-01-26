#!/usr/bin/env node

var asana = require('asana');
var levenshtein = require('fast-levenshtein');

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
.then(function(tags) {

	var threshold = 2;

	for (i = 0; i < tags.length; i++) {
		console.log("Tags similar to \"" + tags[i].name + "\":");
		for (j = 0; j < tags.length; j++) {
			// Check the word distance
			var l = levenshtein.get(tags[i].name, tags[j].name);

			// Check for two inverted words
			if (l > threshold) {
				l = levenshtein.get(tags[i].name, tags[j].name.replace(/^(\w+)(\s|-|_)(\w+)$/,"$3$2$1"));
			}

			// Check for added space or separator
			if (l > threshold) {
				l = levenshtein.get(tags[i].name, tags[j].name.replace(/^(\w+)(\s|-|_)(\w+)$/,"$3$1"));
			}

			if (l <= threshold && l > 0) {
				console.log(tags[j].name);
			}
		}
		console.log("");
	}
	
});