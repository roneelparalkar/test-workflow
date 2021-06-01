import render from "./../../../components/si-footballscorecard/widget-layout-01.vue";
const { getTeamFlag, getDateTime } = require("./../../../sdk/WidgetLibrary/utils");
const utils = { getTeamFlag, getDateTime };
const { footballScorecardDataParser } = require("./../../../sdk/WidgetLibrary/clientServerCommon.js");

const SIClass = class {
  constructor(config, VueLib, widgetConfig, commonFunctions) {
    this.config = config;
    this.Vue = VueLib;
    this.widgetConfig = widgetConfig;
    this.selectedLang = widgetConfig.container.getAttribute("data-lang") || "en";
    this.commonFunctions = commonFunctions;
    this.sport = widgetConfig.container.getAttribute("data-sport") || "football";
    this.league = widgetConfig.container.getAttribute("data-league") || "epl";
    this.gamecode = widgetConfig.container.getAttribute("data-gameCode") || "34385";
    this.widgetId = widgetConfig.container.getAttribute("widget-id");
    this.defaultTab = widgetConfig.container.getAttribute("data-default-tab") || "play-by-play";
    this.isMobile = widgetConfig.container.getAttribute("is-mobile") === "0" ? 0 : 1;
  }

  init() {
    this.hydration();
  }

  hydration() {
    this.getWidgetData()
      .then(resp => {
        this.mountMarkup(resp.gamedata);
      })
      .catch(function(err) {
        console.log("Error while hydration", err);
      });
  }

  getWidgetData() {
    let promiseArray = [];
    let responseData = {};

    for (let keys in this.widgetConfig.apis) {
      let requestUrl = this.widgetConfig.apis[keys]
        .replace("{{LANG}}", this.selectedLang)
        .replace("{{MASTHEAD_ID}}", this.gamecode)
        .replace("{{LEAGUE}}", this.league);

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
  mountMarkup(widgetData) {
    let vueInstance = new Vue(render);
    widgetData.defaultTab = this.defaultTab;
    vueInstance.widgetData = footballScorecardDataParser({ matcheData: widgetData });
    vueInstance.widgetData.isMobile = this.isMobile;
    vueInstance.imagePaths = this.config.imagePaths;

    window.vueInstance = vueInstance;

    vueInstance.tabContent = tab => {
      let _newUrl = window.location.href;
      if (tab === widgetData.lineupTab) {
        widgetData.printLineups();
        _newUrl = _newUrl.replace(widgetData.pbpTab, tab).replace(widgetData.eventTab, tab);
      } else if (tab === widgetData.pbpTab) {
        widgetData.printPlayByPlay();
        _newUrl = _newUrl.replace(widgetData.eventTab, tab).replace(widgetData.lineupTab, tab);
      } else if (tab === widgetData.eventTab) {
        _newUrl = _newUrl.replace(widgetData.pbpTab, tab).replace(widgetData.lineupTab, tab);
      }
      widgetData.defaultTab = tab;
      history.pushState({ page: tab }, tab, _newUrl);
    };

    vueInstance.printEvents = type => {
      widgetData.pbpTabName = type;
      widgetData.printPlayByPlay();
    };

    vueInstance.changeTeam = team => {
      widgetData.selectedTeam = team;
      widgetData.selectedLineUps();
    };

    vueInstance.toggleTimeline = () => (widgetData.isTimeline = !widgetData.isTimeline);

    let refreshIntervalId;
    let isMatchCompleted = () => {
      if (widgetData.matchDetails.is_completed) {
        clearInterval(refreshIntervalId);
      }
    };

    if (!widgetData.matchDetails.is_completed) {
      refreshIntervalId = setInterval(() => {
        this.getWidgetData().then(res => {
          widgetData.matchDetails = res.gamedata.match_detail;
          widgetData.teams = res.gamedata.teams;
          widgetData.events = res.gamedata.events;

          //widgetData.markets = res.markets;
          widgetData.printMastHead();
          widgetData.printTimeline();

          if (widgetData.isLineups) {
            widgetData.printLineups();
          } else if (widgetData.isPlay) {
            widgetData.printPlayByPlay();
          }
          isMatchCompleted();
        });
      }, 17000);
    }

    this.widgetConfig.container.innerHTML = "";

    vueInstance.$mount(this.widgetConfig.container, true);
  }
};

window.SIWidget.SIClass = window.SIWidget.SIClass || {};
window.SIWidget.SIClass["footballScorecard"] = SIClass;
