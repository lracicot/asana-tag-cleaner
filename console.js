#!/usr/bin/env node

var Asana = require('asana');
var Levenshtein = require('fast-levenshtein');
var TagsManager = require('./src/TagsManager');
var prompt = require('prompt-sync').prompt;
var argv = require('yargs').argv;

if ("h" in argv) {
	console.log("usage: ./console                       run the script");
	console.log("   or: ./console.js -t access_token       specify an access token for asana");
	console.log("   or: ./console.js -w workspace_id       specify a workspace id for asana");
	return 1;
}

var accessToken = process.env.ASANA_ACCESS_TOKEN;
var workspaceId = null;

if ("t" in argv) {
	accessToken = argv.t;
}

if ("w" in argv) {
	workspaceId = argv.w;
}

if (!accessToken) {
	console.error('Please add the ASANA_ACCESS_TOKEN to your env variables');
	return 1;
}

var client = Asana.Client.create().useAccessToken(accessToken);
var tagsManager = new TagsManager(client, workspaceId);

if (workspaceId != null) {
	client.workspaces.findById(workspaceId)
	.then(processWorkspace);
	
} else {
	client.workspaces.findAll()
	.then(collection => collection.fetch())
	.filter(processWorkspace);
}

function processWorkspace(workspace)
{
	tagsManager.getTags(workspace.id)
	.then(tags => {
		return tagsManager.findSimilarTags(tags, function (word1, word2) {
			return Levenshtein.get(word1, word2);
		});
	})
	// Console interaction
	.filter(similar => {
		var result;

		process.stdout.write("["+workspace.name+"] These tags are similar.\n");
		process.stdout.write("Which one do you want to keep?\n");

		similar.forEach((tag, i) => {
			console.log((i+1) + ") " + tag.name);
		});

		process.stdout.write("Enter the number of the tag to keep, or <enter> to skip: ");
		result = prompt();

		if (result == "" || result == null) {
			return;
		}

		similar.forEach(tag => {
			if (tag != similar[result-1]) {
				tagsManager.mergeTag(tag, similar[result-1]);
			}
		});
	});
}