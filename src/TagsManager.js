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
				tag1.similar = [];

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
						tag1.similar.push(tag2);
						similarFound.push(tag2);
					}
				});
			});

			tags.forEach(tag => {
				if (tag.similar.length == 0) {
					return;
				}

				tag.similar.push({id: tag.id, name: tag.name});
				similarCluster.push(tag.similar);
			});

			return resolve(similarCluster);
		});
	}

	module.exports = TagsManager;
})();