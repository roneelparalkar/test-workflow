"use strict";

const zlib = require("zlib");
const express = require("express");
const router = express.Router();
const axios = require("axios");
const Redis = require("./../sdk/Redis");
const config = require("./../config");
const cacheManager = require("./../sdk/CacheManager/");
const configUrl = config.CONFIG_API;

const staticFileResponseHandler = (path, resp, type) => {
  let bufferedData = Buffer.from(resp);
  if (type === "css") {
    bufferedData = Buffer.from(resp);
  }
  zlib.gzip(bufferedData, (err, gzippedResponse) => {
    if (err) {
      console.log(err, "---------err");
    } else {
      Redis.saveStaticFiles(path, gzippedResponse.toString("base64"));
    }
  });
};

router.get("/update-config", async (req, res) => {
  let cache = Redis.getConfig();
  const configTypeToReload = req.query.configType && cache[req.query.configType] ? req.query.configType : "all";
  if (configTypeToReload === "all") {
    res.json({ status: "insufficient permission" });
    return;
    // await cacheManager.initCache();
  } else if (configTypeToReload === "cmsConfig") {
    await cacheManager.updateCMSConfig();
    axios.get(configUrl).then(resp => {
      let domain = resp.data.content.ApplicationDomain;

      // resp.data.content.staticfiles.js = ["/static-assets/build/js/main.js"];
      resp.data.content.staticfiles.js.forEach(jsFile => {
        if (jsFile) {
          let api = `${domain}${jsFile}?v=${resp.data.content.jsversion}`;
          axios.get(api).then(resp => {
            if (resp) staticFileResponseHandler(jsFile, resp.data, "js");
          });
        }
      });
      resp.data.content.staticfiles.css.forEach((cssFile, i) => {
        if (cssFile) {
          let api = `${domain}${cssFile}?v=${resp.data.content.cssversion}`;
          axios.get(api).then(resp => {
            if (resp) staticFileResponseHandler(cssFile, resp.data, "css");
          });
        }
      });
    });
  } else if (configTypeToReload === "customNames") {
    await cacheManager.updateCustomNamesCache();
  } else if (configTypeToReload === "translations") {
    await cacheManager.updateTranslationsCache();
  }

  await Redis.updateConfig(configTypeToReload);

  res.json({ status: "success" });
});

router.get("/show-config", (req, res) => {
  res.json(req.configData);
});

module.exports = { router };
