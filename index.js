#!/usr/bin/env node

var asana = require('asana');
var levenshtein = require('fast-levenshtein');
var TagsManager = require('./src/TagsManager');

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
var tagsManager = new TagsManager(client, workspaceId);

tagsManager.getTags(workspaceId, client)
.then(function(tags) {
	return tagsManager.findSimilarTags(tags, function (word1, word2) {
		return levenshtein.get(word1, word2);
	});
})
.then(function(similar) {
	similar.forEach(similarTags => {
		console.log("Similar tags:");

		similarTags.forEach(similarTag => {
			console.log(similarTag.name);
		});
		console.log("");
	});
});