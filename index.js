#!/usr/bin/env node

var asana = require('asana');
var levenshtein = require('fast-levenshtein');

var accessToken = process.env.ASANA_ACCESS_TOKEN;
var workspaceId = process.env.ASANA_WORKSPACE_ID;

if (!accessToken) {
	console.error('Please add the ASANA_ACCESS_TOKEN to your env variables');
	return 1;
}

if (!workspaceId) {
	console.error('Please add the ASANA_WORKSPACE_ID to your env variables');
	return 1;
}

var client = asana.Client.create().useAccessToken(accessToken);


function getTags(workspace, client) {
    return client.tags.findByWorkspace(workspace)
    .then(collection => collection.fetch())
    .then(function(tags) {
        var tagList = [];

        tags.forEach(tag => {
            tagList.push(tag);
        });

        return tagList;
    });
}

function findSimilarTags(tags) {

	return new Promise(function(resolve) {
		var threshold = 2;

		tags.forEach(tag1 => {
			tag1.similar = [];

			tags.forEach(tag2 => {
				// Check the word distance
				var l = levenshtein.get(tag1.name, tag2.name);

				// Check for two inverted words
				if (l > threshold) {
					l = levenshtein.get(tag1.name, tag2.name.replace(/^(\w+)(\s|-|_)(\w+)$/,"$3$2$1"));
				}

				// Check for added space or separator
				if (l > threshold) {
					l = levenshtein.get(tag1.name, tag2.name.replace(/^(\w+)(\s|-|_)(\w+)$/,"$3$1"));
				}

				if (l <= threshold && l > 0) {
					tag1.similar.push(tag2);
				}
			});
		});

		return resolve(tags);
	});
}

client.users.me().then(function(me) {
	console.log("Hello " + me.name);
	return client.tags.findByWorkspace(workspaceId);
})
.then(function() {
	return getTags(workspaceId, client);
})
.then(function(tags) {
	return findSimilarTags(tags);
})
.then(function(tags) {
	tags.forEach(tag => {
		if (tag.similar.length == 0) {
			return;
		}

		console.log("Tags similar to \"" + tag.name + "\":");

		tag.similar.forEach(similarTag => {
			console.log(similarTag.name);
		});
		console.log("");
	});
});