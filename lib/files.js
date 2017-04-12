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

const Files = module.exports = {};

Files.getList = function (req, res, next) {
  const opts = {};
  opts.uploaded_by = req.session.user_id;
  req.client.getList(opts, (err, results) => {
    if (err) {
      console.log(err);
      err.status = 500;
      return next(err);
    }

    async.mapSeries(results, (result, callback) =>{
      req.db.model('user').findOne({"_id": result.uploaded_by}).exec((e, user) => {
        if (e) {
          callback(e);
        }
        result.uploaded_by = user.username;

        callback(null, result)
      });
    },(err, results) => {
      if (err) {
        console.error(err);
        err.status = 500;
        return next(err);
      }
      res.json(results);
    });

  });
};

Files.download = function (req, res, next) {
  req.query.cache_area = req.config.cache;
  req.client.download(req.query, (err, result) => {
    if (err) {
      console.error(err);
      err.status = err.statusCode;
      return next(err);
    }

    res.setHeader('Content-disposition', 'attachment;');
    res.setHeader('Content-Type', result.type);
    res.download(result.path, result.filename, function (e) {
      if (e) {
        console.error(e);
      } else {
        fs.unlink(result.path, (err) => {
          if (err) {
            console.error(err);
            err.status = 500;
            return next(err);
          }
          console.log(result.path + "已经被删除！");
        })
      }
    });

  });
};

Files.upload = function (req, res, next) {
  const params = req.body;
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
          console.error(err);
          err.status = 500;
          return next(err);
        }
        console.log(item.path + "已经被删除！");
      });
    });
    res.json(result);
  });

};