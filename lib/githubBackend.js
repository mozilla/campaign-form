'use strict';

const debug = require('debug')('campaign-form:lib:githubBackend');
const { Octokit } = require('@octokit/rest');
const S3 = require('./S3');

const {
  GITHUB_TOKEN,
  OWNER,
  REPO,
  BASE_URL,
} = process.env;

if (!GITHUB_TOKEN || !OWNER || !REPO || !BASE_URL) {
  console.error('The following ENV variables need to be set: GITHUB_TOKEN, OWNER, REPO, BASE_URL');
  process.exit(1);
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

const AWS_S3_BUCKET_URL_PREFIX = S3.getURLPrefix();

module.exports = {
  createIssue,
};

async function createIssue(fields) {
  debug('PREPARING_GITHUB_ISSUE');
  const text = await prepareIssueText(fields);
  const summary = fields.find((field) => field.name === 'summary');
  const firefoxVersion = fields.find((field) => field.name === 'firefox');

  if (!text) {
    throw new Error('TEXT_INVALID');
  }

  const labels = ['triage'];

  const osLabel = getOSLabel(firefoxVersion.text);
  if (osLabel) {
    labels.push(osLabel);
  }

  const issueParams = {
    owner: OWNER,
    repo: REPO,
    title: summary.text,
    body: text,
    labels,
  }

  const result = await octokit.issues.create(issueParams);
  debug('CREATED_ISSUE', result.data && result.data.number);
  return result;
}

async function prepareIssueText(fields) {
  let text = '';

  try {
    await uploadImagesIfNeeded(fields);
  } catch (error) {
    debug('UPLOAD_FAILED_NOT_ADDING_SCREENSHOT', error);
  }

  fields.map((field) => {
    const fieldIssueLabelConfig = field.config;
    const fieldIssueText = field.text;

    if (!fieldIssueText || fieldIssueLabelConfig.hidden) {
      return;
    }

    if (fieldIssueLabelConfig && fieldIssueLabelConfig.heading) {
      text += `${fieldIssueLabelConfig.content}\n${fieldIssueText}\n\n`;
    } else if (fieldIssueLabelConfig && fieldIssueLabelConfig.image) {
      text += `${fieldIssueLabelConfig.content} \n![Problem Screenshot](${AWS_S3_BUCKET_URL_PREFIX}/${fieldIssueText})\n\n`;
    } else {
      text += `${fieldIssueLabelConfig.content}${fieldIssueText}\n`;
    }
  });

  return text;
}

async function uploadImagesIfNeeded(fields) {
  const imageFields = fields.filter((field) => field.config.image);

  for (const imageField of imageFields) {
    await S3.uploadImage({ fileName: imageField.text });
  }
}

function getOSLabel(userAgent) {
  if (/Android/.test(userAgent)) {
    return 'Android';
  }

  if (/iOS/.test(userAgent)) {
    return 'iOS';
  }

  return '';
}
