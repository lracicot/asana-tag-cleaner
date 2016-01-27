#!/usr/bin/env node

var Asana = require('asana');
var Levenshtein = require('fast-levenshtein');
var TagsManager = require('./src/TagsManager');
var Prompt = require('prompt');

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

var client = Asana.Client.create().useAccessToken(accessToken);
var tagsManager = new TagsManager(client, workspaceId);

tagsManager.getTags(workspaceId, client)
.then(function(tags) {
	return tagsManager.findSimilarTags(tags, function (word1, word2) {
		return Levenshtein.get(word1, word2);
	});
})
// Console interaction
.then(function(tags) {
	promptKeepTag = function(index) {
		var schema = {
			properties: {
				keepIndex: {
					pattern: /^[\d]+$/,
					message: 'This should be a numeric value',
					required: false,
					description: "Enter the number of the tag to keep, or <enter> to skip."
				}
			}
		};

		Prompt.start();
		Prompt.get(schema, function (error, result) {
			if (error) { console.log(error); return 1; }
			if (result.keepIndex == "") {
				if (index + 1 < tags.length) {
					printSimilarTags(index+1);
				}
				return;
			}

			tags[index].forEach(tag => {
				if (tag != tags[index][result.keepIndex-1]) {
					tagsManager.mergeTag(tag, tags[index][result.keepIndex-1]);
				}
			});

			if (index + 1 < tags.length) {
				printSimilarTags(index+1);
			}
		});
	}

	printSimilarTags = function(index) {
		similar = tags[index];

		console.log("These tags are similar. Which one do you want to keep?");

		similar.forEach(function(tag, i) {
			console.log((i+1) + ") " + tag.name);
		});

		promptKeepTag(index)
	};

	printSimilarTags(0);
});