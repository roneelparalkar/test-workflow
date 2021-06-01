"use strict";
const CLIENT_CONFIG = require("./../config");

const isValidHost = req => {
  if (process.env.NODE_ENV === "development" || req._parsedUrl.pathname === "/404") {
    return true;
  } else {
    let cmsConfig = req.configData.cmsConfig;
    const allowedHosts = cmsConfig.content.name.split(",");
    return allowedHosts.includes(req.headers.host);
  }
};

const checkRedirection = req => {
  try {
    const redirectionConfig = req.configData.widgetConfig.redirections;
    const urlToCheck = req._parsedUrl.pathname;
    if (redirectionConfig[urlToCheck]) {
      if (typeof redirectionConfig[urlToCheck] === "string") return { redirectUrl: redirectionConfig[urlToCheck] };
      return { redirectUrl: redirectionConfig[urlToCheck].url, statusCode: redirectionConfig[urlToCheck].statusCode };
    } else {
      let regexRedirectionUrlsObj = req.configData.widgetConfig.regexRedirections;
      let urlToRedirect,
        statusCode = 301;
      Object.keys(regexRedirectionUrlsObj).find(key => {
        let urlValue = typeof regexRedirectionUrlsObj[key] === "string" ? regexRedirectionUrlsObj[key] : regexRedirectionUrlsObj[key].url;
        // let regexKey = typeof key === "string" ? key : key.url;
        let regExp = new RegExp(key);
        let regexMatched = regExp.exec(urlToCheck);
        if (regexMatched) {
          urlToRedirect = urlValue;
          for (let i = 1; i < regexMatched.length; i++) {
            urlToRedirect = urlToRedirect.replace(`{${i}}`, regexMatched[i]);
          }
          if (typeof regexRedirectionUrlsObj[key] !== "string") statusCode = regexRedirectionUrlsObj[key].statusCode;
          return true;
        }
        return false;
      });
      return { redirectUrl: urlToRedirect, statusCode };
    }
  } catch (e) {
    return false;
  }
};

const myCookieEncode = function(val) {
  return val;
};

// const handleWebViewHeaders = (req, res) => {
//   if (req.headers.auth === req.configData.widgetConfig.authKey) {
//     let URCCookie = req.headers._urc;
//     let USCCookie = req.headers._usc;
//     if (req.headers.setlogincookie === "1") {
//       res.cookie("_URC", URCCookie, { maxAge: 3600000, httpOnly: true, secure: true });
//       res.cookie("_USC", USCCookie, { maxAge: 3600000, httpOnly: true });
//     }
//   }
// };

const handleWebViewHeaders = (req, res) => {
  if (req.headers.auth === req.configData.widgetConfig.authKey) {
    let URCCookie = req.headers._urc;
    let USCCookie = req.headers._usc;
    if (req.headers.setlogincookie === "1") {
      if (URCCookie) {
        res.cookie("_URC", URCCookie, { maxAge: 10 * 60 * 60 * 1000, secure: true, encode: myCookieEncode });
      }
      if (USCCookie) res.cookie("_USC", USCCookie, { maxAge: 10 * 60 * 60 * 1000, httpOnly: true, encode: myCookieEncode });
    }
  }
};

export default async function(req, res, next) {
  try {
    if (isValidHost(req)) {
      // if (process.env.NODE_ENV !== "development") {
      //   req.configData.cmsConfig.content.ApplicationDomain = "https://" + req.headers.host;
      //   req.configData.cmsConfig.content.APIDomain = "https://" + req.headers.host;
      // }
      req.isMobile = req.headers["x-is-mobile"] || req.headers["CloudFront-Is-Mobile-Viewer"] ? 1 : 0;
      req.isWebView = req.query.webview === "true" ? true : false;
      if (req.isWebView) {
        handleWebViewHeaders(req, res);
      }
      // res.cookie("_testcookie", "testcookie", { maxAge: 10 * 60 * 60 * 1000, secure: true });
      const redirectionData = checkRedirection(req);
      if (redirectionData && redirectionData.redirectUrl) {
        res.redirect(redirectionData.statusCode || 301, redirectionData.redirectUrl);
      } else if (req._parsedUrl.pathname.includes("/page/1") && req._parsedUrl.pathname.slice(-2) === "/1") {
        res.redirect(301, req.originalUrl.replace("/page/1", ""));
      } else {
        let cacheTagUrl = req._parsedUrl.pathname;
        cacheTagUrl += req.isMobile ? "?ismobile=1" : "?ismobile=0";
        cacheTagUrl += req.isWebView ? "?iswebview=1" : "?iswebview=0";
        res.setHeader("Edge-Cache-Tag", cacheTagUrl);

        next();
      }
    } else {
      res.redirect("/404");
    }
  } catch (e) {
    console.log("Server Middleware Error", e);
  }
}
