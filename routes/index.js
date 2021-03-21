'use strict';

const debug = require('debug')('mozilla-proton-campaign-form:routes');
const express = require('express');
const formHandling = require('../lib/formHandling');
const githubBackend = require('../lib/githubBackend');

const router = express.Router();

router.get('/', async (req, res) => {
  debug('INCOMING_REQUEST_INDEX');
  res.render('index', {
    success: /true/.test(req.query.success),
    submitted: /true/.test(req.query.submitted),
  });
});

router.post('/create', async (req, res) => {
  debug('INCOMING_REQUEST_CREATE');
  try {
    const fields = await formHandling.parseForm(req);
    const issueInfo = await githubBackend.createIssue(fields);
    const issueNumber = issueInfo && issueInfo.data && issueInfo.data.number;
    debug('ISSUE_CREATED_REDIRECTING_BACK', issueNumber);
    res.redirect('/?success=true&submitted=true');
  } catch(error) {
    debug('OH_NO_COULD_NOT_CREATE', error);
    res.redirect('/?success=false&submitted=true');
  }
});

module.exports = router;
