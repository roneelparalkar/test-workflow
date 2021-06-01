"use strict";
const fs = require("fs");
const axios = require("axios");
const CONFIG = require("./../../config");
const Redis = require("./../Redis/");
const axiosHeaders = { headers: { "Accept-Encoding": "gzip" } };
const environmentToOverrideConfig = ["development"];

const cacheManager = {
  initCache: async cb => {
    let promiseArray = [];
    let cache = {
      cmsConfig: {},
      widgetConfig: {},
      translations: {},
      customNames: {}
    };

    const cmsConfig = await axios.get(CONFIG.CONFIG_API, axiosHeaders);
    cache.cmsConfig = cmsConfig.data;
    cache.cmsConfig.localLangConfig = CONFIG.LOCAL_LANG_CONFIG;

    if (environmentToOverrideConfig.includes(process.env.NODE_ENV)) {
      cache.cmsConfig.content.feconfig = await cacheManager.getServerWidgetObject();
      // cache.cmsConfig.content.jsversion = process.env.NODE_ENV.toLowerCase() + "-" + cache.cmsConfig.content.jsversion;
      cache.cmsConfig.content.jsversion = process.env.NODE_ENV.toLowerCase() + "-2.48";
      cache.cmsConfig.content.feedversion = process.env.NODE_ENV.toLowerCase() + "-1.02";
    }

    const applicationDomain = cache.cmsConfig.content.ApplicationDomain;
    const apiDomain = cache.cmsConfig.content.APIDomain;
    // const applicationDomain = "https://cf-sportsadda.sportz.io";
    // const apiDomain = "https://cf-sportsadda.sportz.io";
    const imgVersion = cache.cmsConfig.content.playerImg;
    const feedVersion = cache.cmsConfig.content.feedversion;

    cache.cmsConfig.content.feconfig = JSON.parse(
      JSON.stringify(cache.cmsConfig.content.feconfig)
        .replace(/{{IMGVERSION}}/g, imgVersion)
        .replace(/{{DOMAIN_URL}}/g, applicationDomain)
        .replace(/{{BASE_URL}}/g, apiDomain)
        .replace(/{{FEEDVERSION}}/g, feedVersion)
    );

    cache.widgetConfig = cache.cmsConfig.content.feconfig;

    cache.cmsConfig.content.LangConfig.forEach(async langData => {
      let transApi = cache.widgetConfig.commonApis.translations
        .replace("{{LANG}}", langData.langvalue)
        .replace("{{FEEDVERSION}}", cache.cmsConfig.content.feedversion);

      let translationPromise = axios.get(transApi, axiosHeaders);
      promiseArray.push(translationPromise);
      const translationData = await translationPromise;
      cache.translations[langData.langvalue] = translationData.data;
    });

    cache.cmsConfig.content.LangConfig.forEach(async langData => {
      let cnApi = cache.widgetConfig.commonApis.customNames
        .replace("{{LANG}}", langData.langvalue)
        .replace("{{FEEDVERSION}}", cache.cmsConfig.content.feedversion);
      let customNamePromise = axios.get(cnApi, axiosHeaders);
      promiseArray.push(customNamePromise);
      const customNameData = await customNamePromise;
      cache.customNames[langData.langvalue] = customNameData.data;
    });

    await Promise.all(promiseArray);

    setTimeout(async () => {
      await Redis.saveConfig(cache);
      if (cb) cb();
    }, 10);
  },
  getServerWidgetObject: async (isJSON = true) => {
    return new Promise(function(resolve) {
      const data = fs.readFileSync(`./sdk/WidgetLibrary/config/${process.env.NODE_ENV}-serverWidgetConfig.json`, "utf8");
      // const data = fs.readFileSync(`./sdk/WidgetLibrary/config/beta-serverWidgetConfig.json`, "utf8");
      resolve(isJSON ? cacheManager.getObjectFromJSON(data) : data);
    });
  },
  getObjectFromJSON: function(json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      console.log(e);
      return {};
    }
  },
  updateTranslationsCache: async () => {
    const cache = Redis.getConfig();
    let promiseArray = [];

    cache.cmsConfig.content.LangConfig.forEach(async langData => {
      let transApi = cache.widgetConfig.commonApis.translations
        .replace("{{LANG}}", langData.langvalue)
        .replace("{{FEEDVERSION}}", cache.cmsConfig.content.feedVersion);
      let translationPromise = axios.get(transApi, axiosHeaders);
      promiseArray.push(translationPromise);
      const translationData = await translationPromise;
      cache.translations[langData.langvalue] = translationData.data;
    });

    await Promise.all(promiseArray);
    setTimeout(async () => {
      await Redis.saveConfig(cache);
    }, 10);
  },
  updateCustomNamesCache: async () => {
    const cache = Redis.getConfig();
    let promiseArray = [];

    cache.cmsConfig.content.LangConfig.forEach(async langData => {
      let cnApi = cache.widgetConfig.commonApis.customNames
        .replace("{{LANG}}", langData.langvalue)
        .replace("{{FEEDVERSION}}", cache.cmsConfig.content.feedVersion);
      let customNamePromise = axios.get(cnApi, axiosHeaders);
      promiseArray.push(customNamePromise);
      const customNameData = await customNamePromise;
      cache.customNames[langData.langvalue] = customNameData.data;
    });

    await Promise.all(promiseArray);
    setTimeout(async () => {
      await Redis.saveConfig(cache);
    }, 10);
  },
  // updateWidgetConfigCache: async () => {
  //   const cache = Redis.getConfig();
  //   cache.widgetConfig = await cacheManager.getServerWidgetObject(CONFIG.BUCKET, CONFIG.BUCKET_FILE_PATH);
  //   await Redis.saveConfig(cache);
  // },
  updateCMSConfig: async () => {
    const cache = Redis.getConfig();
    const cmsConfig = await axios.get(CONFIG.CONFIG_API, axiosHeaders);
    cache.cmsConfig = cmsConfig.data;

    const applicationDomain = cache.cmsConfig.content.ApplicationDomain;
    const apiDomain = cache.cmsConfig.content.APIDomain;
    // const applicationDomain = "https://cf-sportsadda.sportz.io";
    // const apiDomain = "https://cf-sportsadda.sportz.io";
    const imgVersion = cache.cmsConfig.content.playerImg;
    const feedVersion = cache.cmsConfig.content.feedversion;

    cache.cmsConfig.content.feconfig = JSON.parse(
      JSON.stringify(cache.cmsConfig.content.feconfig)
        .replace(/{{IMGVERSION}}/g, imgVersion)
        .replace(/{{DOMAIN_URL}}/g, applicationDomain)
        .replace(/{{BASE_URL}}/g, apiDomain)
        .replace(/{{FEEDVERSION}}/g, feedVersion)
    );

    cache.widgetConfig = cache.cmsConfig.feconfig;
    cache.localLangConfig = CONFIG.LOCAL_LANG_CONFIG;
    await Redis.saveConfig(cache);
  }
};

module.exports = cacheManager;
