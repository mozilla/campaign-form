# Mozilla Campaign Form

This is a basic campaign form to submit issues to a GitHub repository. This has previously been used in campaigns such as [Firefox Foxfooding](https://community.mozilla.org/en/campaigns/firefox-foxfooding-campaign/) and [FxA testing](https://community.mozilla.org/en/campaigns/fxa-settings-test-day/). These campaigns previously lived in separate repos, upcoming campaigns will be handled in this repository as they come up.

Note that this form is basic and might not support everything you need. Several parts could be abstracted, however these campaigns are mostly short-lived and code gets adjusted as needed. PRs are welcome though!

## Setting up the server

### Requirements

* Make sure you have Node.js installed
* Create a repository to hold the submitted issues
* Create a "triage" label for issues in that repository
* Create the necessary labels in the GitHub repo according to `lib/githubBackend.js`
* Create a personal access token for your GitHub user

### Starting

Then you can start the server with the following command. Make sure to replace the placeholders with your data.

```
$ git clone <URL>
$ cd campaign-form
$ npm ci
$ GITHUB_TOKEN=<yourGitHubToken> OWNER=<yourGitHubUsername> REPO=<yourGitHubRepoForIssues> SESSION_SECRET=someSECRET BASE_URL=http://localhost:4000/ AWS_ACCESS_KEY_ID="<yourAWSAccessKeyID" AWS_SECRET_ACCESS_KEY="<yourAWSAccessKey>" AWS_S3_BUCKET_NAME="<yourAWSS3BucketName>" npm start
```

Note: you can leave off the AWS configuration, however attachments won't be uploaded and won't be shown in the resulting GitHub issue.

Now you can access the website for it at ```localhost:4000```.

## Environment variables

The following environment variables are needed. Note that you will need to set these up in Heroku as well!

| Variable | Description | Example
|---|---|---|
| AWS_ACCESS_KEY_ID | AWS Access Key ID to upload attachments | ... |
| AWS_SECRET_ACCESS_KEY | AWS Access Key Secret to upload attachments | ... |
| AWS_S3_BUCKET_NAME | AWS S3 Bucket name to upload attachments to | campaign-form-uploads |
| BASE_URL | URL of the form | https://foxfooding-form.mozilla.community/ |
| GITHUB_TOKEN | Token for the GitHub user to post issues | ... |
| OWNER | GitHub username / organization hosting the reporting repo | mozilla |
| REPO | GitHub repository name to host the issues | campaign-form |
| SESSION_SECRET | Random string used as session secret | foobarbaz.... |

## Changes needed for new campaigns

### Coding

* Check the `fields_config.json` file and adjust if needed
* Adjust `lib/formHandling.js` to work together with the defined fields
* Adjust `views/index.pug` to reflect correct strings and fields (if a previous campaign got stopped, you might need to revert previous changes to get back the form fields and then adjust them)
* Adjust logo in `public/` and its alt text in `views/index.pug`
* Adjust title in `views/layout.pug`
* Check `lib/githubBackend.js` to adjust possible version / OS GitHub labels and create them in the GitHub issues repo
* Adjust `public/client.js` if any fields need pre-filling (such as UA)
* Adjust header background color in `public/style.css` if needed

### Operation / Admin

* Add `mozilla-campaign-form-bot` GitHub user as collaborator to issues repository
