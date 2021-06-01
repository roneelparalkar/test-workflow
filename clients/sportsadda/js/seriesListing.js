import render from "./../../../components/si-seriesarchives/widget-layout-01.vue";
// import { siseriesarchives } from "./../../../sdk/model/componentTypeParser";
const { seriesListingParser } = require("./../../../sdk/WidgetLibrary/clientServerCommon.js");

const SIClass = class {
  constructor(config, VueLib, widgetConfig, commonFunctions) {
    this.config = config;
    this.Vue = VueLib;
    this.widgetConfig = widgetConfig;
    this.selectedLang = widgetConfig.container.getAttribute("selectedLanguage");
    this.commonFunctions = commonFunctions;
    this.serverData = widgetConfig.container.getAttribute("server-data");
    this.serverData = JSON.parse(this.serverData);
    this.titleElem = widgetConfig.container.querySelector(".title");
    this.titleData = {
      tag: this.titleElem ? this.titleElem.tagName.toLowerCase() : "",
      displayTitle: this.titleElem ? this.titleElem.innerText : ""
    };
    this.selectedYear = this.serverData.selectedYear || "2021";
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

    for (let keys in this.widgetConfig.apis) {
      let requestUrl = this.widgetConfig.apis[keys].replace("{{YEAR}}", this.selectedYear);
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
    const inputSelectorData = {
      widgetData: {
        apis: data
      },
      meta_info: {
        widget_title_tag: this.titleData.tag
      },
      years: this.widgetConfig.years,
      selectedYear: this.selectedYear,
      display_title: this.titleData.displayTitle,
      dataToPass: {}
    };

    const pageInfo = {
      configData: {
        cmsConfig: {
          content: {
            ApplicationDomain: this.serverData.applicationDomain
          }
        }
      }
    };

    let widgetParsedData = seriesListingParser(inputSelectorData, pageInfo);

    let vueInstance = new Vue(render);
    vueInstance.widgetData = widgetParsedData;
    vueInstance.$mount(this.widgetConfig.container, true);

    vueInstance.getNewYearSeriesData = function(year) {
      this.widgetData.selectedYear = year;
      self.selectedYear = year;
      self
        .getWidgetData()
        .then(resp => {
          inputSelectorData.selectedYear = year;
          inputSelectorData.widgetData.apis = resp;
          this.widgetData = seriesListingParser(inputSelectorData, pageInfo);
          // setTimeout(() => {
          //   // self.scrollToClosestMonth();
          // }, 100);
        })
        .catch(function(err) {
          console.log("Error while hydration", err);
        });
    };

    // this.scrollToClosestMonth();
    // Scroll to current month
  }
  scrollToClosestMonth() {
    let currDate = new Date();
    let currDateCombo = currDate.getFullYear() + "-" + currDate.getMonth();
    let closetMonthFound = false;
    let totalElements = document.querySelectorAll(".series-container .series-content").length;
    document.querySelectorAll(".series-container .series-content").forEach((el, index) => {
      if (closetMonthFound) return;
      let month = el.querySelector(".list-date .month").innerText;
      let year = el.querySelector(".list-date .year").innerText;
      let dateCombo = year + "-" + month;
      let monthDateForFixtures = new Date(dateCombo);
      dateCombo = monthDateForFixtures.getFullYear() + "-" + monthDateForFixtures.getMonth();
      if (currDateCombo === dateCombo) {
        closetMonthFound = true;
      } else if (+monthDateForFixtures > +currDate) {
        closetMonthFound = true;
      }

      if (closetMonthFound || index === totalElements - 1) {
        let { offsetTop } = el;
        scroll({ top: offsetTop, behavior: "smooth" });
      }
    });
  }
};

window.SIWidget.SIClass = window.SIWidget.SIClass || {};
window.SIWidget.SIClass["seriesListing"] = SIClass;
