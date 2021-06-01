"use strict";
(function() {
  const CONFIG = {
    DOMAIN: {
      PROD: ["www.sportsadda.com", "prod.sportsadda.com"],
      BETA: ["beta-sportsadda.sportz.io", "stg-sportsadda.sportz.io"]
    },
    ENV: "local",
    BUCKET_PATH: {
      PROD: "/static-assets/build/",
      BETA: "/static-assets/build/",
      DEV: "/static-assets/build/"
    },
    CONFIG_PATH: `js/clientConfig.json?v=${window.feedVersion}`,
    DEV_CONFIG_PATH: `js/localClientConfig.json?v=${window.feedVersion}`,
    KEYS: {
      WIDGET_CONFIG: "si_widget_config",
      CUSTOM_NAMES: "si_widget_customNames",
      TRANSLATIONS: "si_widget_translations"
    }
  };
  const host = window.location.host;

  if (CONFIG.DOMAIN.BETA.indexOf(host) != -1) {
    CONFIG.ENV = "beta";
  } else if (CONFIG.DOMAIN.PROD.indexOf(host) != -1) {
    CONFIG.ENV = "prod";
  } else if (host.includes("localhost")) {
    CONFIG.ENV = "dev";
  }

  let pollingStarted = false;
  let pushIsActive = false;
  let commonDependenciesLoaded = false;
  let callBackArray = [];

  let basePath = CONFIG.ENV === "prod" ? CONFIG.BUCKET_PATH.PROD : CONFIG.ENV === "beta" ? CONFIG.BUCKET_PATH.BETA : CONFIG.BUCKET_PATH.DEV;

  let baseAPIPath = window.location.origin + "/";

  let config = localStorage.getItem(CONFIG.KEYS.WIDGET_CONFIG);
  let customNamesLoaded, translationsLoaded, localStoredCustomNames, localStoredTranslations;
  let selectedLanguage = "en";

  let commonFunctions = {
    apiCall: (url, params = {}) => {
      if (!url.includes("http")) {
        if (
          url.includes("default.aspx") ||
          url.includes("cricket/live") ||
          url.includes("football/live") ||
          url.includes("kabaddi/live") ||
          url.includes("sifeeds") ||
          url.includes("videofeeds") ||
          url.includes("gateway") ||
          url.includes("fantasy") ||
          url.includes("api/") ||
          url.includes("static-assets/feeds/")
        ) {
          url = baseAPIPath + url;
        } else {
          url = basePath + url;
        }
      }
      let isLocalStorageSupported = typeof Storage !== "undefined" ? true : false;
      let cachedApiResult = isLocalStorageSupported ? localStorage.getItem(url) : "";
      if (cachedApiResult) {
        let data = JSON.parse(cachedApiResult);
        if (new Date(data.validDate) > new Date()) {
          return new Promise((resolve, reject) => {
            let response = params.isJSON ? JSON.parse(data.apiData) : JSON.stringify(data.apiData);
            resolve(response);
          });
        }

        if (window.SIWidget.currentPromises[url]) {
          return new Promise((resolve, reject) => {
            resolve(window.SIWidget.currentPromises[url]);
          });
        }
      }

      let apiPromise = new Promise((resolve, reject) => {
        let xhrObj = new XMLHttpRequest();
        const method = params.body ? "POST" : "GET";
        xhrObj.open(method, url);
        if (params.headers)
          params.headers.forEach(header => {
            xhrObj.setRequestHeader(header.key, header.value);
          });
        xhrObj.onreadystatechange = function() {
          if (xhrObj.readyState === 4 && this.status === 200) {
            if (xhrObj.responseText) {
              let apiResponse = xhrObj.responseText;
              let response = params.isJSON ? JSON.parse(apiResponse) : apiResponse;
              resolve(response);
            }
          }
          if (xhrObj.readyState === 4 && (this.status === 403 || this.status === 404)) {
            reject();
          }
        };
        if (params.body) xhrObj.send(JSON.stringify(params.body));
        else xhrObj.send();
      });

      return apiPromise;
    },
    loadJsFile: src => {
      if (!src.includes("?v=")) {
        let versionToAppend = window.jsVersion || config.versions.files;
        src += "?v=" + versionToAppend;
      }
      if (window.SIWidget && window.SIWidget.currentPromises && window.SIWidget.currentPromises[src]) {
        return window.SIWidget.currentPromises[src];
      }

      let jsPromise = new Promise((resolve, reject) => {
        let scriptTag = window.document.createElement("script");
        scriptTag.onload = function(data) {
          delete window.SIWidget.currentPromises[src];
          resolve(data);
        };
        scriptTag.src = src;
        window.document.getElementsByTagName("head")[0].appendChild(scriptTag);
      });
      window.SIWidget.currentPromises = window.SIWidget.currentPromises || {};
      window.SIWidget.currentPromises[src] = jsPromise;
      return jsPromise;
    },
    loadCommonDependencies: () => {
      localStoredCustomNames = JSON.parse(localStorage.getItem(CONFIG.KEYS.CUSTOM_NAMES)) || {};
      localStoredTranslations = JSON.parse(localStorage.getItem(CONFIG.KEYS.TRANSLATIONS)) || {};
      window.SIWidget.customNames =
        localStoredCustomNames &&
        localStoredCustomNames[selectedLanguage] &&
        localStoredCustomNames[selectedLanguage].localVersion === window.feedVersion
          ? localStoredCustomNames[selectedLanguage]
          : "";
      window.SIWidget.translations =
        localStoredTranslations &&
        localStoredTranslations[selectedLanguage] &&
        localStoredTranslations[selectedLanguage].localVersion === config.versions.language
          ? localStoredTranslations[selectedLanguage]
          : "";
      return new Promise((resolve, reject) => {
        let APIPromises = [];
        let responseKeys = [];
        if (!window.SIWidget.customNames && config.commonApis.customNames) {
          let customNames = commonFunctions.apiCall(
            config.commonApis.customNames.replace("{{LANG}}", selectedLanguage).replace("{{FEEDVERSION}}", window.feedVersion),
            { isJSON: true }
          );
          APIPromises.push(customNames);
          responseKeys.push("customNames");
          customNamesLoaded = true;
        }
        if (!window.SIWidget.translations && config.commonApis.translations) {
          let translations = commonFunctions.apiCall(
            config.commonApis.translations.replace("{{LANG}}", selectedLanguage).replace("{{FEEDVERSION}}", window.feedVersion),
            { isJSON: true }
          );
          APIPromises.push(translations);
          responseKeys.push("translations");
          translationsLoaded = true;
        }
        if (window.Vue) {
          window.SIWidget.SIVue = window.Vue;
        } else {
          let vueLib = commonFunctions.loadJsFile(config.vue.cdn);
          APIPromises.push(vueLib);
          responseKeys.push("SIVue");
        }
        if (config.clientDependencies)
          config.clientDependencies.forEach(lib => {
            if (!window[lib.name]) {
              let dependency = commonFunctions.loadJsFile(lib.url);
              APIPromises.push(dependency);
            }
          });
        if (APIPromises.length) {
          Promise.all(APIPromises)
            .then(function(response) {
              responseKeys.forEach((key, index) => {
                window.SIWidget[key] = response[index];
              });
              commonFunctions.setLocalStorageForLoadedData();
              commonDependenciesLoaded = true;
              resolve();
            })
            .catch(function(err) {
              console.log(err);
            });
        } else {
          commonDependenciesLoaded = true;
          commonFunctions.setLocalStorageForLoadedData();
          resolve();
        }
      });
    },
    setLocalStorageForLoadedData: () => {
      if (customNamesLoaded) {
        customNamesLoaded = false;
        window.SIWidget.customNames.localVersion = window.feedVersion;
        localStoredCustomNames[selectedLanguage] = window.SIWidget.customNames;
        localStorage.setItem(CONFIG.KEYS.CUSTOM_NAMES, JSON.stringify(localStoredCustomNames));
      }

      if (translationsLoaded) {
        translationsLoaded = false;
        window.SIWidget.translations.localVersion = config.versions.language;
        localStoredTranslations[selectedLanguage] = window.SIWidget.translations;
        localStorage.setItem(CONFIG.KEYS.TRANSLATIONS, JSON.stringify(localStoredTranslations));
      }
    },
    loadClientDependencies: () => {
      let promiseArray = [];
      config.clientDependencies.forEach(lib => {
        if (!window[lib.name]) {
          let dependency = commonFunctions.loadJsFile(lib.url);
          APIPromises.push(dependency);
        }
      });
      return Promise.all(promiseArray);
    },
    getMatchesData: (reqParams, cb) => {
      let pushStream = {};
      let id = Date.now();
      callBackArray.push({ cb: cb, params: reqParams, id });
      if (!pollingStarted) {
        pollingStarted = true;
        setInterval(() => {
          if (!callBackArray.length) return;
          if (pushStream.readyState === 2) {
            pushIsActive = false;
          }

          let enablePush = true;
          if (reqParams.vueInstance && (reqParams.vueInstance.selectedLang !== "en" || !config.isPushAllowed)) {
            enablePush = false;
            if (pushStream.readyState === 1 || pushStream.readyState === 0) {
              pushStream.close();
              pushIsActive = false;
            }
          }

          if (!pushIsActive) {
            let feedApi = config.intervalApi;
            let defaultLang = "en";
            if (reqParams.vueInstance && reqParams.vueInstance.selectedLang !== "en") {
              defaultLang = reqParams.vueInstance.selectedLang;
            }
            feedApi = feedApi.replace("{{LANG}}", defaultLang);
            commonFunctions.apiCall(feedApi, { isJSON: true }).then(resp => {
              callBackArray.forEach(cbObject => {
                cbObject.cb(cbObject.params, resp);
              });
            });

            if (enablePush) {
              pushStream = new EventSource(config.pushStream);
              pushStream.onopen = () => {
                pushIsActive = true;
              };
              pushStream.onmessage = respMatchData => {
                let matchData = JSON.parse(respMatchData.data);
                callBackArray.forEach(cbObject => {
                  cbObject.cb(cbObject.params, matchData, true);
                });
                pushIsActive = true;
              };
              pushStream.onerror = e => {
                pushStream.close();
                pushIsActive = false;
              };
            }
          }
        }, config.refreshInterval * 1000);
      }
    },
    removeCallBack: id => {
      if (id) {
        callBackArray = callBackArray.filter(callBackData => callBackData.id !== id);
      }
    }
  };

  function loadConfig() {
    let configPath = CONFIG.ENV === "prod" || CONFIG.ENV === "beta" ? CONFIG.CONFIG_PATH : CONFIG.DEV_CONFIG_PATH;
    commonFunctions
      .apiCall(configPath, { isJSON: true })
      .then(resp => {
        config = resp;
        config.basePath = basePath;
        config = JSON.parse(
          JSON.stringify(config)
            .replace(/{{IMGVERSION}}/g, window.imgVersion)
            .replace(/{{DOMAIN_URL}}/g, window.location.origin)
        );
        if (CONFIG.ENV === "prod") {
          config.validity = Date.now() + config.configCacheTime * 60 * 1000;
          localStorage.setItem(CONFIG.KEYS.WIDGET_CONFIG, JSON.stringify(config));
        } else if (config.beta_commonApis) {
          config.commonApis = config.beta_commonApis;
        }
        initializeWidgetHydration();
      })
      .catch(err => {
        console.log(err);
      });
  }

  function initializeWidgetHydration() {
    let Vue, widgetInstance;
    window.SIWidget = window.SIWidget || {};
    // window.SIWidget.utils = require("./utils.js");
    window.SIWidget.currentPromises = {};

    commonFunctions
      .loadCommonDependencies()
      .then(() => {
        Vue = window.SIWidget.SIVue;
      })
      .catch(err => {
        console.log(err);
      });

    let widgets = document.querySelectorAll(".si-waf-widget");

    let widgetJsPromise = [];
    widgets.forEach(element => {
      let widgetId = element.getAttribute("widget-id");
      // if (config.widgets[widgetType] && config.widgets[widgetType][widgetView])

      if (config.widgets[widgetId]) {
        let configData = JSON.parse(JSON.stringify(config.widgets[widgetId]));
        configData.container = element;
        configData.widgetId = widgetId;

        let instancePromise = new Promise(resolve => {
          if (window.SIWidget.SIClass && window.SIWidget.SIClass[configData.className]) {
            let widgetClass = window.SIWidget.SIClass[configData.className];
            widgetInstance = new widgetClass(config, Vue, configData, commonFunctions);
            resolve(widgetInstance);
          } else {
            commonFunctions.loadJsFile(basePath + configData.fileName).then(response => {
              if (configData.className) {
                let widgetClass = window.SIWidget.SIClass[configData.className];
                widgetInstance = new widgetClass(config, Vue, configData, commonFunctions);
                resolve(widgetInstance);
              } else {
                resolve({});
              }
            });
          }
        });
        widgetJsPromise.push(instancePromise);
      }
    });
    Promise.all(widgetJsPromise)
      .then(resp => {
        function checkForWidgetInitialization() {
          if (commonDependenciesLoaded) {
            resp.forEach(widget => {
              if (widget.init) widget.init();
            });
            return;
          } else {
            setTimeout(() => {
              checkForWidgetInitialization();
            }, 200);
          }
        }
        checkForWidgetInitialization();
      })
      .catch(err => console.log(err));
  }

  // setTimeout(() => {
  if (config && CONFIG.ENV === "prod") {
    config = JSON.parse(config);
    if (config.validity > Date.now()) {
      initializeWidgetHydration();
    } else {
      loadConfig();
    }
  } else {
    loadConfig();
  }
  // }, 1500);
})();
