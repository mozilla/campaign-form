'use strict';

const fs = require('fs/promises');
const debug = require('debug')('campaign-form:lib:S3');
const AWS = require('aws-sdk');
const mime = require('mime');

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
} = process.env;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

module.exports = {
  uploadImage,
  getURLPrefix,
};

async function uploadImage({ fileName }) {
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET_NAME) {
    debug('AWS_NOT_CONFIGURED_SKIP_UPLOAD');
    return;
  }

  debug('UPLOADING_IMAGE_TO_S3', fileName);

  const fileContent = await fs.readFile(`${__dirname}/../public/screenshot-${fileName}`);
  const mimeType = mime.lookup(fileName);

  const params = {
    Bucket: AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
    ContentType: mimeType,
    ACL: 'public-read',
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (error) => {
      if (error) {
        debug('AWS_S3_UPLOAD_ERROR', error);
        return reject(new Error('AWS_S3_UPLOAD_ERROR'));
      }

      debug('AWS_S3_UPLOAD_SUCCESSFUL');
      resolve();
    });
  });
}

function getURLPrefix() {
  return `https://${AWS_S3_BUCKET_NAME}.s3.eu-central-1.amazonaws.com`;
}
