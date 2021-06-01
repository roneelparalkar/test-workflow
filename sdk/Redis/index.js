"use strict";
const { createRedis } = require("./redis-connection");
const REDIS_KEYS = require("./redis-keys");
const clusterReader = createRedis("read");
const clusterWriter =
  !process.env.REDIS_WRITE_END_POINT || process.env.REDIS_WRITE_END_POINT === process.env.REDIS_READ_END_POINT ? clusterReader : createRedis("write");
const pub = createRedis();
const sub = createRedis();
const pubSubChannelName = REDIS_KEYS.NAMESPACE + "-updateConfig";

const Redis = {};

Redis.configObj = {};

Redis.updateConfigObj = async (type = "all") => {
  if (type === "all" || type === "cmsConfig") {
    const cmsConfigStr = await clusterReader.get(REDIS_KEYS.CMS_CONFIG);
    Redis.configObj.cmsConfig = JSON.parse(cmsConfigStr);
  }
  Redis.configObj.widgetConfig = Redis.configObj.cmsConfig.content.feconfig;
  // if (type==='all' || type === "widgetConfig") {
  //   const widgetConfigStr = await clusterReader.get(REDIS_KEYS.WIDGET_CONFIG);
  //   Redis.configObj.widgetConfig = JSON.parse(widgetConfigStr);
  // }
  if (type === "all" || type === "translations") {
    const translationStr = await clusterReader.get(REDIS_KEYS.TRANSLATIONS);
    Redis.configObj.translations = JSON.parse(translationStr);
  }
  if (type === "all" || type === "customNames") {
    const customNameStr = await clusterReader.get(REDIS_KEYS.CUSTOM_NAMES);
    Redis.configObj.customNames = JSON.parse(customNameStr);
  }
  return;
};

Redis.updateConfig = configType => {
  pub.publish(pubSubChannelName, configType);
};

Redis.saveConfig = async config => {
  await clusterWriter.set(REDIS_KEYS.CMS_CONFIG, JSON.stringify(config.cmsConfig));
  await clusterWriter.set(REDIS_KEYS.TRANSLATIONS, JSON.stringify(config.translations));
  await clusterWriter.set(REDIS_KEYS.CUSTOM_NAMES, JSON.stringify(config.customNames));
  // await clusterWriter.set(REDIS_KEYS.WIDGET_CONFIG, JSON.stringify(config.widgetConfig));
  return Redis.updateConfigObj();
};

Redis.getConfig = () => {
  return Redis.configObj;
};

Redis.getLinkVersion = link => {
  return clusterReader.hget(REDIS_KEYS.CSS_LINKS.concat(link), "version");
};

Redis.getLinkData = link => {
  return clusterReader.hget(REDIS_KEYS.CSS_LINKS.concat(link), "data");
};

Redis.saveLinkData = (link, data, version) => {
  return clusterWriter.hmset(REDIS_KEYS.CSS_LINKS.concat(link), { data, version });
};

Redis.getStaticAssetData = link => {
  let extension = process.env.NODE_ENV === "development" ? REDIS_KEYS.CSS_LINK_EXTENSION_DEV : REDIS_KEYS.CSS_LINK_EXTENSION;
  let key = extension.concat(link);
  return clusterReader.get(key);
};

Redis.saveStaticFiles = (link, data) => {
  let extension = process.env.NODE_ENV === "development" ? REDIS_KEYS.CSS_LINK_EXTENSION_DEV : REDIS_KEYS.CSS_LINK_EXTENSION;
  let key = extension.concat(link);
  return clusterWriter.set(key, data);
};

sub.subscribe(pubSubChannelName, function(err, count) {
  if (err) {
    console.log("Error on channel subscription");
  }
});

sub.on("message", (channel, configTypeToReload) => {
  if (channel === pubSubChannelName) {
    Redis.updateConfigObj(configTypeToReload);
  }
});

module.exports = Redis;
