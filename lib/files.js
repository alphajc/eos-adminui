/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Created by gavin at 4/11/17 10:25 AM.
 */

"use strict";

const fs = require('fs');
const async = require('async');
const urlencode = require('urlencode');

const Files = module.exports = {};

Files.getList = function (req, res, next) {
  const opts = {};
  opts.uploaded_by = req.session.user_id;
  req.client.getList(opts, (err, results) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      async.mapSeries(results, (result, callback) => {
        req.db.model('user').findOne({"_id": result.uploaded_by}).exec((e, user) => {
          if (e) {
            return callback(e);
          }
          result.uploaded_by = user.username;
          result.last_modify = result.last_modify.split('T')[0];

          callback(null, result)
        });
      },(err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json(err);
        } else {
          try {
            res.json(results);
          } catch (e) {
            console.error(e);
          }
        }
      });
    }

  });
};

Files.download = function (req, res, next) {
  req.params.cache_area = req.config.cache;
  req.client.download(req.params, (err, result) => {
    console.log(result);
    if (err) {
      console.error(err);
      err.status = err.statusCode;
      return next(err);
    }

    const stats = fs.statSync(result.path);
    if(stats.isFile()){
      res.download(result.path, result.filename, (e) => {
        if (e) {
          console.error(e);
        } else {
          fs.unlink(result.path, (err) => {
            if (err) {
              console.error(err);
              err.status = 500;
              return next(err);
            }
          });
        }
      });
    } else {
      res.send(404);
    }

  });
};

Files.upload = function (req, res, next) {
  const params = req.body;
  console.log(req.files);
  const args = [];

  req.files.forEach((file) => {
    const item = {};
    for (let key in params) {
      item[key] = params[key];
    }
    item.originalname = file.originalname;
    item.path = file.path;
    item.type = file.mimetype;
    item.uploaded_by = req.session.user_id;

    args.push(item);
  });

  req.client.upload(args, (err, result) => {
    args.forEach((item) => {
      fs.unlink(item.path, (err) => {
        if (err) {
          return console.error(err);
        }
        console.log(item.path + "已经被删除！");
      });
    });
    res.json(result);
  });

};