/**
 * Created by gavin on 17-3-25.
 */

const client = require('eos-client');

exports.createClient = (config) => {
  const obj = {};
  obj.client = client.createClient(config);
  obj.handler = attachEosClient;

  return obj;

  function attachEosClient(req, res, next) {
    req.client = obj.client;
    next();
  }
};