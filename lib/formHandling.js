'use strict';

const debug = require('debug')('campaign-form:lib:formHandling');
const path = require('path')
const { v4: uuidv4 } = require('uuid');
const { IncomingForm } = require('formidable');

const fieldDefinition = require('../field_config.json');

module.exports = {
  parseForm,
};

function parseForm(req) {
  const form = new IncomingForm();

  return new Promise((resolve, reject) => {
    const formFields = {};
    const uniqueName = uuidv4();

    form.parse(req)
      .on('fileBegin', (name, file) => {
        debug('INCOMING_REQUEST_FILE_BEGIN', name, file.originalFilename, file.mimetype);

        if (!file.originalFilename) {
          debug('ABORT_FILE_BEGIN_DUE_TO_MISSING_FILE_NAME');
          return;
        }

        file.extension = path.extname(file.originalFilename) || '.png';
        file.filepath = `/tmp/attachment-${uniqueName}${file.extension}`;
      })
      .on('field', (name, field) => {
        debug('INCOMING_REQUEST_FIELD', name, field);

        if (name === 'github' && field && !field.startsWith('@')) {
          field = `@${field}`;
        }

        formFields[name] = field;
      })
      .on('file', (name, file) => {
        debug('INCOMING_REQUEST_FILE', name, uniqueName, file.mimetype);
        formFields[name] = `${uniqueName}${file.extension}`;
      })
      .on('aborted', () => {
        debug('INCOMING_REQUEST_ABORTED');
      })
      .on('error', (err) => {
        debug('INCOMING_REQUEST_ERROR', err);
        reject(err);
      })
      .on('end', () => {
        const allFieldsValidated = validateFields(formFields);
        if (!allFieldsValidated) {
          return reject(new Error('VALIDATION_FAILED'));
        }

        const preparedFields = prepareFieldsToArray(formFields);
        const sortedFields = preparedFields.sort(sortByConfigId);
        resolve(sortedFields);
      });
  });
}

function validateFields(fields) {
  return Object.keys(fieldDefinition).every((fieldKey) => {
    const definition = fieldDefinition[fieldKey];

    if (!definition) {
      console.error('NO_DEFINITION_FOUND_FOR', fieldKey);
      return false;
    }

    if (definition.required && !fields[fieldKey]) {
      return false;
    }

    const regex = new RegExp(definition.pattern, 'i');
    if (!regex.test(fields[fieldKey])) {
      return false;
    }

    return true;
  });
}

function prepareFieldsToArray(fields) {
  return Object.keys(fields).map((fieldKey) => {
    return {
      name: fieldKey,
      text: fields[fieldKey],
      config: fieldDefinition[fieldKey],
    };
  });
}

function sortByConfigId(a, b) {
  return a.config.id - b.config.id;
}