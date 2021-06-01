import render from "./../../../components/si-standings/widget-layout-01.vue";
const { parseStandingsDataForGroups } = require("./../../../sdk/WidgetLibrary/clientServerCommon.js");
const SIClass = class {
  constructor(config, VueLib, widgetConfig, commonFunctions) {
    this.config = config;
    this.Vue = VueLib;
    this.widgetConfig = widgetConfig;
    this.selectedLang = "en";
    this.commonFunctions = commonFunctions;
    this.serverData = this.widgetConfig.container.getAttribute("server-data");
    this.serverData = JSON.parse(this.serverData);
    this.seriesId = this.serverData.seriesId;
    this.leagueCode = this.serverData.leagueCode;
    this.sportName = this.serverData.selectedSportName;
    this.sportId = this.serverData.selectedSport;
  }
  init() {
    this.hydration();
  }
  hydration() {
    this.getWidgetData()
      .then(resp => {
        this.mountMarkup(resp);
      })
      .catch(function(err) {
        console.log("Error while hydration", err);
      });
  }
  getWidgetData() {
    let promiseArray = [];
    let responseData = {};
    this.widgetConfig.apis.standingsData = this.widgetConfig.sportApis[this.sportId];

    for (let keys in this.widgetConfig.apis) {
      let requestUrl = this.widgetConfig.apis[keys].replace("{{LEAGUECODE}}", this.leagueCode).replace("{{SERIESID}}", this.seriesId);

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
    let clientCache = {
      customNames: { en: window.SIWidget.customNames },
      translations: { en: window.SIWidget.translations }
    };

    let widgetParsedData = {
      groups: parseStandingsDataForGroups(this.sportName, data.standingsData),
      selectedGroupIndex: 0,
      dataToPass: this.serverData,
      showGroups: false
    };

    widgetParsedData.customNames = clientCache.customNames;
    let vueInstance = new Vue(render);
    vueInstance.widgetData = widgetParsedData;
    vueInstance.imagePaths = this.config.imagePaths;

    vueInstance.$mount(this.widgetConfig.container, true);
  }
};

window.SIWidget.SIClass = window.SIWidget.SIClass || {};
window.SIWidget.SIClass["standings"] = SIClass;
