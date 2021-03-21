# Mozilla Proton Campaign

Campaign Bug Reporting page for the upcoming Proton Campaign.

## Setting up the server

### Requirements

* Make sure you have Node.js installed
* Create a repository to hold the submitted issues
* Create a "triage" label for issues in that repository
* Create a "Firefox 88", "Firefox 89", "Firefox 90", "Windows, "Mac" and "Linux" label
* Create a personal access token for your GitHub user

### Starting

Then you can start the server with the following command. Make sure to replace the placeholders with your data.

```
$ git clone <URL>
$ cd proton-campaign
$ npm ci
$ GITHUB_TOKEN=<yourGitHubToken> OWNER=<yourGitHubUsername> REPO=<yourGitHubRepoForIssues> SESSION_SECRET=someSECRET BASE_URL=http://localhost:4000/ npm start
```

Now you can access the website for it at ```localhost:4000```.

**Note:** When running locally, screenshots won't be appended to the resulting GitHub Issue
