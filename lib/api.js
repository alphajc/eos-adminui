/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Created by gavin at 4/10/17 11:02 PM.
 */

"use strict";

const api = require('express').Router();
const log = require('bunyan').createLogger({
  name: 'adminui',
  level: process.env.LOG || require('../etc/config.json').logLevel || 'info'
});

api.use((req) => {
  req.log = log;
});

const auth = require('./auth');
api.post('/auth', auth.authenticate);
api.get('/auth', auth.requireAuth);

module.exports = api;