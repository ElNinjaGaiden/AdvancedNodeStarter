const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

const { redisUrl } = keys;
const { promisify } = util;
const { Query } = mongoose;
const exec = Query.prototype.exec;

const client = redis.createClient(redisUrl);
client.hget = promisify(client.hget);

Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  return this;
}

Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify({ ...this.getQuery(), collection: this.mongooseCollection.name });
  const cacheValue = await client.hget(this.hashKey, key);

  if (cacheValue) {
    const cachedData = JSON.parse(cacheValue);
    console.log('Returning cached data', cachedData);
    return Array.isArray(cachedData)
      ? cachedData.map(item => new this.model(item))
      : new this.model(cachedData);
  }

  const result = await exec.apply(this, arguments);
  client.hset(this.hashKey, key, JSON.stringify(result));
  return result;
};


module.exports = {
  clearHash (key) {
    client.del(JSON.stringify(key));
  }
}