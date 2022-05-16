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
    await uploadAttachmentsIfNeeded(fields);
  } catch (error) {
    debug('UPLOAD_FAILED_NOT_ADDING_ATTACHMENT', error);
  }

  fields.map((field) => {
    const fieldIssueLabelConfig = field.config;
    const fieldIssueText = field.text;

    if (!fieldIssueText || fieldIssueLabelConfig.hidden) {
      return;
    }

    if (fieldIssueLabelConfig && fieldIssueLabelConfig.heading) {
      text += `${fieldIssueLabelConfig.content}\n${fieldIssueText}\n\n`;
    } else if (fieldIssueLabelConfig && fieldIssueLabelConfig.attachment) {
      text += getAttachmentText(fieldIssueLabelConfig, fieldIssueText);
    } else {
      text += `${fieldIssueLabelConfig.content}${fieldIssueText}\n`;
    }
  });

  return text;
}

async function uploadAttachmentsIfNeeded(fields) {
  const attachmentFields = fields.filter((field) => field.config.attachment);

  for (const attachmentField of attachmentFields) {
    await S3.uploadFile({ fileName: attachmentField.text });
  }
}

function getOSLabel(userAgent) {
  if (/Macintosh/.test(userAgent)) {
    return 'Mac';
  }

  if (/Windows/.test(userAgent)) {
    return 'Windows';
  }

  if (/Linux/.test(userAgent)) {
    return 'Linux';
  }

  return '';
}

function getAttachmentText(fieldIssueLabelConfig, fieldIssueText) {
  const url = `${AWS_S3_BUCKET_URL_PREFIX}/${fieldIssueText}`;
  let attachmentText = `${fieldIssueLabelConfig.content}\n`;

  // embed attachment as image
  if (/\.png$|\.gif$|\.jpe*g$/.test(fieldIssueText)) {
    attachmentText += `![Attachment](${url})\n`
  }

  // always also add a link to the upload in case embedding doesn't work properly
  attachmentText += `[Link to the original attachment](${url})\n\n`;

  return attachmentText;
}