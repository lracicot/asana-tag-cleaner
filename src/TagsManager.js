(function() {
	var TagsManager = function(client, workspace) {
		this.client = client;
		this.workspace = workspace;
	};

	TagsManager.prototype.getTags = function(workspace, client) {
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

	TagsManager.prototype.findSimilarTags = function(tags, distanceCalculator) {
		return new Promise(function(resolve) {
			var threshold = 2;
			var similarFound = [];
			var similarCluster = []

			tags.forEach(tag1 => {
				var similarTags = [];
				similarTags.push(tag1);

				if (similarFound.indexOf(tag1) > -1) {
					return;
				}

				tags.forEach(tag2 => {
					// Check the word distance
					var l = distanceCalculator(tag1.name, tag2.name);

					// Check for two inverted words
					if (l > threshold) {
						l = distanceCalculator(tag1.name, tag2.name.replace(/^(\w+)(\s|-|_)(\w+)$/,"$3$2$1"));
					}

					// Check for added space or separator
					if (l > threshold) {
						l = distanceCalculator(tag1.name, tag2.name.replace(/^(\w+)(\s|-|_)(\w+)$/,"$3$1"));
					}

					if (l <= threshold && l > 0) {
						similarTags.push(tag2);
						similarFound.push(tag2);
					}
				});

				if (similarTags.length == 1) {
					return;
				}

				similarCluster.push(similarTags);
			});

			return resolve(similarCluster);
		});
	};

	TagsManager.prototype.mergeTag = function(mergeIt, keepIt) {
		var client = this.client;
		client.tasks.findByTag(mergeIt.id).then(function(collection) {
			collection.stream().on('data', function(task) {
				// Tag deletion is not implemented yet in Asana, but we can remove the tag from the task.
				client.tasks.removeTag(task.id, {tag: mergeIt.id});
				client.tasks.addTag(task.id, {tag: keepIt.id});
			});
		}).then(function() {
			// Tag deletion is not implemented yet in Asana.
			//client.tags.delete(mergeIt.id);
		});
	};

	module.exports = TagsManager;
})();