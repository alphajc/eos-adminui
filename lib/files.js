/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Created by gavin at 4/11/17 10:25 AM.
 */

"use strict";

const Files = module.exports = {};

Files.getList = function (req, res, next) {

};

Files.download = function (req, res, next) {
  res.send("download");
};

Files.upload = function (req, res, next) {
  console.log(req.file);
  res.send('successful');
};