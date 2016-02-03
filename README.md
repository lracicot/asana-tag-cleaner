#Asana Tag Cleaner

A frienly tool to merge similar tags in asana.

## Installation

### Node

Install with git:

```sh
git clone git@github.com:lracicot/asana-tag-cleaner.git
cd asana-tag-cleaner
npm install
```

Make sure that console.js is executable:

```sh
chmod +x console.js
```

## Usage

You will need to get an acces token from Asana. You will the need to set the access token, either as env variable or with the -t parameter

```sh
export ASANA_ACCESS_TOKEN="access_token"; ./console.js
```

```sh
./console.js -t access_token
```

You can also specify a workspace or otherwise let all the workspaces being processed.

```sh
./console.js -t access_token -w workspace_id
```

Note: It seems that the Asana API does not allow to delete a tag. When you merge a tag, all references to it will be replace by the tag you keep, but the old tag will still be there.
