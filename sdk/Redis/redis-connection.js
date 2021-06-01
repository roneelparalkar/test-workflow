"use strict";
const Redis = require("ioredis");

const REDIS_READ_CONFIG = {
  port: process.env.REDIS_READ_PORT,
  host: process.env.REDIS_READ_END_POINT
};
const REDIS_WRITE_CONFIG = {
  port: process.env.REDIS_WRITE_PORT,
  host: process.env.REDIS_WRITE_END_POINT
};
const REDIS_KEYS = require("./redis-keys");
const redisOpts = { keyPrefix: REDIS_KEYS.NAMESPACE };
module.exports = {
  createRedis: (type = "read", cb) => {
    const REDIS = type === "read" ? REDIS_READ_CONFIG : REDIS_WRITE_CONFIG;
    const cluster = new Redis(REDIS, redisOpts);
    cluster.on("error", e => console.log("Error while connecting Redis! :(", e, REDIS));
    cluster.on("connect", () => console.log("Redis Connected! :)"));
    cluster.on("ready", () => {
      console.log("Redis is Ready! :)");
      if (cb) cb();
    });
    return cluster;
  }
};
