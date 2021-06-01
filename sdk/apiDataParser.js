"use strict";
const zlib = require("zlib");
const cheerio = require("cheerio");
const dcopy = require("deep-copy");
const allSettled = require("promise.allsettled");
const componentTypeParser = require("./model/componentTypeParser");
const apiValueReplacerAndDependencyCaller = require("./WidgetLibrary/apiReplacer");
const utils = require("./WidgetLibrary/utils");
const paginate = require("./helpers/paginate");
const helperFunctions = require("./helpers");
const mobileComponents = require("./mappers/mobileComponentMapper");
const axiosHeaders = { "Accept-Encoding": "gzip" };

const attributeParser = ($, tag) => {
  const htmlAttributes = $(tag).attr();
  let response = {};
  Object.keys(htmlAttributes).forEach(key => {
    response[key] = htmlAttributes[key];
  });
  return response;
};

const LRUCacheManager = (LRUCache, api, data) => {
  let validity = Date.now() + 4 * 60 * 1000;
  let dataToStore = { value: data, validity };
  LRUCache.set(api, JSON.stringify(dataToStore));
};

const bifurcateCssAndWidgetData = ({ allApis, fetchedData, response, context, LRUCache, signaturesToCacheArray }) => {
  try {
    fetchedData.forEach((fetchedResponse, index) => {
      if (fetchedResponse.status === "fulfilled") {
        if (allApis[index].css) {
          // if (context.route.path === "/") {
          //   console.log(fetchedResponse.value.cssText, "-----------fetchedResponse.value");
          //   fs.writeFileSync("./text.txt", JSON.stringify(fetchedResponse.value));
          // }
          if (fetchedResponse.value) response.inlineCssArray.push({ cssText: fetchedResponse.value.cssText, type: "text/css" });
        } else if (allApis[index].data) {
          if (!allApis[index].servedFromCache) {
            const toBeCached = signaturesToCacheArray.find(signature => allApis[index].api.includes(signature));
            if (toBeCached) {
              LRUCacheManager(LRUCache, allApis[index].api, fetchedResponse.value);
            }
          }
          const { sectionId } = allApis[index];
          const apiKey = allApis[index].key;
          response.pageInfo.wafModules[sectionId].widgetData = response.pageInfo.wafModules[sectionId].widgetData || { apis: {} };
          response.pageInfo.wafModules[sectionId].widgetData.apis[apiKey] = fetchedResponse.value;
        } else if (allApis[index].script) {
          response.inlineJsArray = response.inlineJsArray || [];
          if (process.env.NODE_ENV === "development") {
            response.inlineJsArray.push({ scriptContent: fetchedResponse.value });
            return;
          }
          if (fetchedResponse.value && fetchedResponse.value.jsText) response.inlineJsArray.push({ scriptContent: fetchedResponse.value.jsText });
        }
      } else {
        if (allApis[index].data) {
          const { sectionId } = allApis[index];
          const apiKey = allApis[index].key;
          response.pageInfo.wafModules[sectionId].widgetData = response.pageInfo.wafModules[sectionId].widgetData || { apis: {} };
          response.pageInfo.wafModules[sectionId].widgetData.apis[apiKey] = {};
        }
      }
    });
  } catch (e) {
    context.$winstonLog.error({ location: "bifurcateCssAndWidgetData", name: e.name, message: e.message });
  }
};

const createHeadObj = (params, jsVersion) => {
  const links = [];
  // link.forEach(el => {
  //   links.push({ rel: "preload", as: "style", href: el.link });
  //   links.push({ rel: "stylesheet", href: el.link, onload: "this.media='all'", media: "print" });
  // });
  const scripts = [];
  if (params.inlineJsArray)
    params.inlineJsArray.forEach(jsDataObj => {
      scripts.push({
        innerHTML: jsDataObj.scriptContent,
        async: true,
        body: true
      });
    });

  // scripts.push({
  //   src: `/static-assets/build/js/main.js?v=${jsVersion}`,
  //   async: true,
  //   body: true
  // });

  return {
    htmlAttrs: params.htmlAttributes,
    bodyAttrs: params.bodyAttributes,
    style: params.inlineCssArray ? params.inlineCssArray : [],
    script: scripts,
    // link: links,
    __dangerouslyDisableSanitizers: ["style", "script"]
  };
};

const getUnzippedStaticAssets = (staticAssetsPath, Redis, type) => {
  return new Promise(async (resolve, reject) => {
    let staticAssetData = await Redis.getStaticAssetData(staticAssetsPath);
    if (staticAssetData) {
      staticAssetData = staticAssetData;
      let buffferData = Buffer.from(staticAssetData, "base64");
      zlib.gunzip(buffferData, (err, respData) => {
        if (err) {
          reject();
        } else {
          let assetValue = respData.toString("utf8");
          if (type === "css") {
            resolve({ cssText: assetValue });
          } else {
            resolve({ jsText: assetValue });
          }
        }
      });
    } else {
      reject();
    }
  });
};

const fetchAllApis = (apis, axios, Redis, LRUCache) => {
  const promiseArray = [];
  apis.forEach(apiData => {
    if (apiData.link || (apiData.script && process.env.NODE_ENV !== "development")) {
      let type = apiData.link ? "css" : "js";
      promiseArray.push(getUnzippedStaticAssets(apiData.link || apiData.script, Redis, type));
    } else {
      const api = apiData.data ? apiData.api : apiData.script ? apiData.script : apiData.link;
      let storedDataString = LRUCache.get(api);
      if (storedDataString) {
        let storedData = JSON.parse(storedDataString);
        if (storedData.validity > Date.now()) {
          apiData.servedFromCache = true;
          promiseArray.push(
            new Promise((resolve, reject) => {
              resolve(storedData.value);
            })
          );
          // axios
          //   .$get(`${api}`, { headers: axiosHeaders })
          //   .then(data => {
          //     LRUCacheManager(LRUCache, api, data);
          //   })
          //   .catch(e => {
          //     // Some Error On API
          //   });
        } else {
          promiseArray.push(axios.$get(`${api}`, { headers: axiosHeaders }));
        }
      } else {
        promiseArray.push(axios.$get(`${api}`, { headers: axiosHeaders }));
      }
    }
  });
  return promiseArray;
};

const getStaticAssetLinks = (pageInfo, cmsConfig, response, context) => {
  try {
    let links = [];
    const cssVersion = cmsConfig.content.cssversion;
    if (!pageInfo.content.custom_meta_info) {
      return links;
    }
    const metaInfo = pageInfo.content.custom_meta_info;
    let linksArray = metaInfo.inline_links.css || [];
    let jsArray = metaInfo.inline_links.js || [];
    // context.$winstonLog.info(JSON.stringify({ location: "getStaticAssetLinks", success: true }));
    if (linksArray)
      linksArray = linksArray.map(path => {
        return { css: true, link: path };
      });
    if (process.env.NODE_ENV === "development") {
      return linksArray;
    }
    if (jsArray)
      jsArray = jsArray.map(path => {
        return { script: path };
      });
    return linksArray.concat(jsArray);
  } catch (e) {
    context.$winstonLog.error({ location: "getStaticAssetLinks", name: e.name, message: e.message });
    return [];
  }
};

const getLayoutName = layoutName => {
  try {
    if (layoutName) {
      layoutName = layoutName.toLowerCase().replace(/_/g, "-");
      return layoutName;
    }
    return "";
  } catch (e) {
    console.log(e);
    return "";
  }
};

const isToBeRedirected = (context, response) => {
  try {
    if (response.pageInfo.content.isredirect === "1") {
      const parentUrl = response.pageInfo.content.redirectparent ? "/" + response.pageInfo.content.redirectparent : "";
      const redirectUrl = parentUrl + "/" + response.pageInfo.content.redirecturl;
      context.redirect(redirectUrl);
      return true;
    }
    return false;
  } catch (e) {
    context.$winstonLog.error({ location: "isToBeRedirected", name: e.name, message: e.message });
  }
};

const languageSelection = (response, context) => {
  try {
    const routeParams = context.route.path.split("/");
    const lanConfig = response.pageInfo.configData.cmsConfig.content.LangConfig;

    let defaultLanguageString = response.pageInfo.configData.cmsConfig.content.DefaultLanguage
      ? response.pageInfo.configData.cmsConfig.content.DefaultLanguage.toLowerCase()
      : "default";
    const defaultLanguage =
      response.pageInfo.configData.cmsConfig.localLangConfig && response.pageInfo.configData.cmsConfig.localLangConfig[defaultLanguageString]
        ? response.pageInfo.configData.cmsConfig.localLangConfig[defaultLanguageString]
        : "en";
    response.pageInfo.selectedLanguage = defaultLanguage;
    if (lanConfig.length <= 1) {
      return;
    }
    if (routeParams[1]) {
      lanConfig.find(langInfo => {
        if (langInfo.langvalue === routeParams[1]) {
          response.pageInfo.selectedLanguage = langInfo.langvalue;
          return true;
        }
        return false;
      });
      if (!response.pageInfo.selectedLanguage) {
        response.pageInfo.selectedLanguage = defaultLanguage;
      }
    }
    // context.$winstonLog.info(JSON.stringify({ location: "languageSelection", success: true }));
  } catch (e) {
    context.$winstonLog.error({ location: "languageSelection", name: e.name, message: e.message });
  }
};

const mapIfInWidgetLibraryAndClearDependencies = (
  pageInfo,
  context,
  { componentName, sectionId, widgetName, componentType, LRUCache, signaturesToCacheArray }
) => {
  try {
    const widgetData = pageInfo.configData.widgetConfig.widgets[componentType];
    if (widgetData) {
      let widgetDataCopy = dcopy(widgetData);
      widgetDataCopy.componentName = componentName;
      widgetDataCopy.widgetName = widgetName;
      pageInfo.wafModules[sectionId].widgetConfig = widgetDataCopy;
      if (apiValueReplacerAndDependencyCaller[componentType]) {
        return apiValueReplacerAndDependencyCaller[componentType]({
          pageInfo,
          sectionId,
          widgetName,
          winstonLogger: context.$winstonLog,
          axios: context.$axios,
          route: context.route,
          LRUCache,
          signaturesToCacheArray,
          LRUCacheManager
        });
      }
    }
    // context.$winstonLog.info(JSON.stringify({ location: "mapIfInWidgetLibraryAndClearDependencies", success: true }));
    return widgetData;
  } catch (e) {
    context.$winstonLog.error({ location: "mapIfInWidgetLibraryAndClearDependencies", name: e.name, message: e.message });
  }
};

const structureGetPageInfo = (pageInfo, context) => {
  try {
    const { master_module } = pageInfo.content;
    const { module } = pageInfo.content;
    pageInfo.wafModules = {};
    const allModules = master_module.concat(module);
    allModules.forEach(moduleData => {
      pageInfo.wafModules[moduleData.selector] = moduleData;
    });
    // context.$winstonLog.info(JSON.stringify({ location: "structureGetPageInfo", success: true }));
  } catch (e) {
    context.$winstonLog.error({ location: "structureGetPageInfo", name: e.name, message: e.message });
  }
};

const sectionToComponentConverterAndWidgetLinker = async ($, pageInfo, context, LRUCache, signaturesToCacheArray) => {
  try {
    let sections = $("body section");
    let promiseArray = [];
    sections.each(function(i, elem) {
      const sectionId = $(this).attr("id");
      let componentType = $(this).attr("data-component");
      if (!componentType) return;
      componentType = componentType.toLowerCase().replace(/ /g, "");
      const mobileLayout = getLayoutName($(this).attr("data-template"));
      const desktopLayout = getLayoutName($(this).attr("data-template"));
      let widgetName = context.req.isMobile && mobileLayout ? mobileLayout : desktopLayout;
      widgetName = widgetName.toLowerCase();
      if (context.req.isMobile) {
        if (mobileComponents[componentType] && mobileComponents[componentType][mobileLayout]) {
          widgetName = `mob-${mobileLayout}`;
        } else {
          widgetName = desktopLayout;
        }
      }

      const componentName = `${componentType}-${widgetName}`;
      let moduleData = pageInfo.wafModules[sectionId];
      if (moduleData) {
        if (
          (context.req.isWebView && moduleData.show_in_app) ||
          (!context.req.isWebView && context.req.isMobile && moduleData.show_in_mobile) ||
          (!context.req.isWebView && !context.req.isMobile && moduleData.show_in_web)
        ) {
          const promiseData = mapIfInWidgetLibraryAndClearDependencies(pageInfo, context, {
            componentName,
            sectionId,
            widgetName,
            componentType,
            LRUCache,
            signaturesToCacheArray
          });
          promiseArray.push(promiseData);

          moduleData.componentType = componentType;
          let componentData = ` 
            :widget-data="fullPageData.pageInfo.wafModules['${sectionId}'].widgetParsedData"
            :winston-logger="fullPageData.pageInfo.winstonLogger"
            :config-data="fullPageData.pageInfo.configData.cmsConfig"
            :global-data="fullPageData.pageInfo.globalData"
            :is-bot = fullPageData.pageInfo.isBot`;
          if (pageInfo.configData.widgetConfig.widgets[componentType]) {
            // If interactive component OR component is from widget Library
            componentData = ` 
              :widget-data="fullPageData.pageInfo.wafModules['${sectionId}'].widgetParsedData" 
              :translations="fullPageData.pageInfo.configData.translations['${pageInfo.selectedLanguage}']"
              :image-paths="fullPageData.pageInfo.configData.widgetConfig.imagePaths"
              :winston-logger="fullPageData.pageInfo.winstonLogger"
              :config-data="fullPageData.pageInfo.configData.cmsConfig"
              :is-bot = fullPageData.pageInfo.isBot
              :selected-language="fullPageData.pageInfo.selectedLanguage"`;
          }
          $(this).html(`<component :is="'${componentName}'" ${componentData} data-section-id="${sectionId}"> </component>`);
          // context.$winstonLog.info(JSON.stringify({ location: "sccaw-componentName-" + componentName, success: true }));
        }
      }
    });
    await allSettled(promiseArray);
    const bodyHtml = "<div>" + $("body").html() + "</div>";
    // context.$winstonLog.info(JSON.stringify({ location: "sectionToComponentConverterAndWidgetLinker", success: true }));
    return bodyHtml;
  } catch (e) {
    context.$winstonLog.error({ location: "sectionToComponentConverterAndWidgetLinker", name: e.name, message: e.message });
  }
};

const parseMarkupAndLinkWidgets = async (context, response, LRUCache, signaturesToCacheArray) => {
  try {
    const masterHtml = response.pageInfo.content.masterhtml;
    const bodyHtml = response.pageInfo.content.html;
    const finalHtml = masterHtml.replace("<myapp></myapp>", bodyHtml);
    const $ = cheerio.load(`${finalHtml}`);

    response.htmlAttributes = attributeParser($, "html");
    if (context.req.isMobile && !context.route.path.indexOf("/amp/") === 0) {
      response.htmlAttributes.isMobile = "true";
    }
    response.bodyAttributes = attributeParser($, "body");
    if (response.pageInfo.content.custom_meta_info && response.pageInfo.content.custom_meta_info.pageclass) {
      response.bodyAttributes.class = response.pageInfo.content.custom_meta_info.pageclass;
    }

    if (context.req.isWebView) {
      response.bodyAttributes.class = response.bodyAttributes.class + " " + "webview";
    }
    response.bodyMarkup = await sectionToComponentConverterAndWidgetLinker($, response.pageInfo, context, LRUCache, signaturesToCacheArray);
    // context.$winstonLog.info(JSON.stringify({ location: "parseMarkupAndLinkWidgets", success: true }));
    return;
  } catch (e) {
    context.$winstonLog.error({ location: "parseMarkupAndLinkWidgets", name: e.name, message: e.message });
  }
};

const getPageInfoData = async ({ context, configData, axios, customSlug }) => {
  try {
    let slug = customSlug ? encodeURIComponent(customSlug) : encodeURIComponent(context.route.fullPath);

    let getPageInfoUrl = configData.widgetConfig.wafapi.replace("{{SLUG}}", slug);
    if (context.req.isMobile) getPageInfoUrl += `&is_mobile=1`;
    return axios.$get(getPageInfoUrl, { headers: axiosHeaders });
  } catch (e) {
    context.$winstonLog.error({ location: "getPageInfoData", name: e.name, message: e.message });
  }
};

const mainParser = async (context, customSlug = "") => {
  try {
    const axios = context.$axios;
    const { configData, Redis, LRUCache } = context.req;
    const response = {
      pageInfo: {},
      bodyMarkup: "",
      headObj: {},
      inlineCssArray: [],
      htmlAttributes: {},
      bodyAttributes: {}
    };

    const beforeApiTime = Date.now();
    response.pageInfo = await getPageInfoData({ context, configData, axios, customSlug });
    const afterApiTime = Date.now();
    context.req.getPageInfoTime = afterApiTime - beforeApiTime + "ms";

    const redirection = isToBeRedirected(context, response);
    if (redirection) {
      return;
    }

    response.pageInfo.configData = context.req.configData;
    response.pageInfo.isBot = context.req.isBot;
    response.pageInfo.widgetApis = [];
    response.pageInfo.winstonLogger = context.$winstonLog;

    languageSelection(response, context);

    structureGetPageInfo(response.pageInfo, context);

    const signaturesToCacheArray =
      response.pageInfo.configData.widgetConfig &&
      response.pageInfo.configData.widgetConfig.signaturesToCache &&
      response.pageInfo.configData.widgetConfig.signaturesToCache.signatures
        ? response.pageInfo.configData.widgetConfig.signaturesToCache.signatures
        : [];

    await parseMarkupAndLinkWidgets(context, response, LRUCache, signaturesToCacheArray);

    const staticAssetLinks = getStaticAssetLinks(response.pageInfo, configData.cmsConfig, response, context);
    const allApis = staticAssetLinks.concat(response.pageInfo.widgetApis);
    if (process.env.NODE_ENV === "development") {
      allApis.push({
        script: `http://localhost:3000/static-assets/build/js/main.js?v=${configData.cmsConfig.content.jsversion}`
      });
    }

    const beforeCallTime = Date.now();
    const fetchedData = await allSettled(fetchAllApis(allApis, axios, Redis, LRUCache));
    const afterCallTime = Date.now();
    context.req.cssAndWidgetApiTime = afterCallTime - beforeCallTime + "ms";

    bifurcateCssAndWidgetData({ context, allApis, fetchedData, response, cmsConfig: configData.cmsConfig, LRUCache, signaturesToCacheArray });

    response.headObj = createHeadObj(response, configData.cmsConfig.content.jsversion);

    componentTypeParser.parseModules(response.pageInfo, context.$winstonLog, {
      utils,
      isMobile: context.req.isMobile,
      isWebView: context.req.isWebView,
      isServer: true,
      route: context.route,
      customNames: response.pageInfo.configData.customNames[response.pageInfo.selectedLanguage],
      helperFunctions,
      paginate
    });

    if (response.pageInfo.redirection) {
      if (response.pageInfo.redirectToMaxPage && response.pageInfo.maxPageUrl) context.redirect(301, response.pageInfo.maxPageUrl);
      if (response.pageInfo.scorecardUrl) context.redirect(301, response.pageInfo.scorecardUrl);
      if (response.pageInfo.fixturesUrl) context.redirect(301, response.pageInfo.fixturesUrl);
      return;
    }

    // context.$winstonLog.info({ location: "mainParser", success: true });
    return response;
  } catch (e) {
    context.$winstonLog.error({ location: "mainParser", name: e.name, message: e.message });
    return;
  }
};

module.exports = { mainParser };
