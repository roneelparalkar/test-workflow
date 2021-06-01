import render from "./../../../components/si-statsdetail/widget-layout-01.vue";
const { parseStatsDetailData } = require("../../../sdk/WidgetLibrary/clientServerCommon.js");

const SIClass = class {
  constructor(config, VueLib, widgetConfig, commonFunctions) {
    this.config = config;
    this.Vue = VueLib;
    this.widgetConfig = widgetConfig;
    this.selectedLang = "en";
    this.commonFunctions = commonFunctions;
    this.serverData = widgetConfig.container.getAttribute("server-data");
    this.serverData = JSON.parse(this.serverData);
    this.seriesId = this.serverData.seriesId;
    this.statsId = this.serverData.selectedStatId;
    this.isMobile = widgetConfig.container.getAttribute("is-mobile") === "0" ? 0 : 1;
    this.selectedStatType = widgetConfig.container.getAttribute("selected-stats-type");
  }
  init() {
    this.hydration();
  }
  hydration() {
    this.getWidgetData()
      .then(widgetData => {
        this.mountMarkup(widgetData);
      })
      .catch(e => {
        console.log(e);
      });
  }
  getWidgetData() {
    let promiseArray = [];
    let responseData = {};

    // let widgetConfigCopy = this.widgetConfig;
    for (let keys in this.widgetConfig.apis) {
      let requestUrl = this.widgetConfig.apis[keys].replace("{{SERIESID}}", this.seriesId).replace("{{STATSID}}", this.statsId);

      let promiseData = this.commonFunctions
        .apiCall(requestUrl, { isJSON: true })
        .then(response => {
          return (responseData[keys] = response);
        })
        .catch(err => {
          console.log(err);
        });
      promiseArray.push(promiseData);
    }
    return new Promise((resolve, reject) => {
      Promise.all(promiseArray).then(data => {
        return resolve(responseData);
      });
    });
  }
  mountMarkup(data) {
    let self = this;
    let clientCache = {
      customNames: { en: window.SIWidget.customNames },
      translations: { en: window.SIWidget.translations }
    };
    let serverData = this.serverData;
    let serverDataString = JSON.stringify(serverData);
    let widgetParsedData = {
      serverData,
      serverDataString,
      statsConfig: this.widgetConfig.statsConfig,
      statsData: data.stats,
      isMobile: this.isMobile,
      selectedStatType: this.selectedStatType,
      showBattingStatsDD: false,
      showBowlingStatsDD: false,
      showBatBowlStatsDD: false
    };
    parseStatsDetailData(widgetParsedData);

    widgetParsedData.customNames = clientCache.customNames[this.selectedLang];
    let vueInstance = new Vue(render);
    vueInstance.widgetData = widgetParsedData;
    vueInstance.imagePaths = this.config.imagePaths;
    this.widgetConfig.container.innerHTML = "";
    vueInstance.$mount(this.widgetConfig.container, true);

    vueInstance.updateStats = function(statsId, selectedStatType) {
      vueInstance.widgetData.showBatBowlStatsDD = false;
      self.statsId = statsId;
      self.serverData.selectedStatId = statsId;
      self.selectedStatType = selectedStatType ? selectedStatType : "";
      self.init();
    };
  }
};

window.SIWidget.SIClass = window.SIWidget.SIClass || {};
window.SIWidget.SIClass["statsDetail"] = SIClass;
