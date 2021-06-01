import render from "./../../../components/si-scorestrip/widget-layout-01.vue";
const { getTeamCustomName, getTourCustomName, getCustomStatus } = require("./../../../sdk/WidgetLibrary/utils");
const utils = { getTeamCustomName, getTourCustomName, getCustomStatus };
const { scoreStripPreParser, scoreStripDataParser } = require("./../../../sdk/WidgetLibrary/clientServerCommon.js");

const SIClass = class {
  constructor(config, VueLib, widgetConfig, commonFunctions) {
    this.config = config;
    this.Vue = VueLib;
    this.widgetConfig = widgetConfig;
    this.selectedLang = widgetConfig.container.getAttribute("selectedLanguage");
    this.commonFunctions = commonFunctions;
    this.team = widgetConfig.container.getAttribute("team");
    this.tournament = widgetConfig.container.getAttribute("tournament");
    this.sportId = widgetConfig.container.getAttribute("sport");
    this.league = widgetConfig.container.getAttribute("selectedLeague") || "0";
    this.serverData = widgetConfig.container.getAttribute("server-data");
    this.titleElem = widgetConfig.container.querySelector(".title");
    this.titleData = {
      tag: this.titleElem ? this.titleElem.tagName.toLowerCase() : "",
      displayTitle: this.titleElem ? this.titleElem.innerText : ""
    };
  }
  init() {
    this.hydration();
  }
  hydration() {
    this.preApiParser();
    this.getWidgetData()
      .then(resp => {
        this.mountMarkup(resp);
      })
      .catch(function(err) {
        console.log("Error while hydration", err);
      });
  }
  preApiParser() {
    this.serverData = JSON.parse(this.serverData);
    this.fullWidgetData = { extraClass: this.serverData.extraClass, widgetTitleTag: this.serverData.widgetTitleTag };
    this.serverData.has_filter = this.serverData.hasLeagueFilter;

    this.valuesToReplace = {};
    scoreStripPreParser(this.fullWidgetData, {
      toBeFetchedFrom: this.serverData,
      valueReplacerObj: this.valuesToReplace,
      selectedLang: this.selectedLang
    });
  }
  getWidgetData() {
    let promiseArray = [];
    let responseData = {};
    this.widgetConfig.apis.bettingOdds = this.widgetConfig.odds[this.fullWidgetData.sport];
    for (let keys in this.widgetConfig.apis) {
      let requestUrl = this.widgetConfig.apis[keys]
        .replace("{{LANG}}", this.selectedLang)
        .replace("{{SPORT}}", this.fullWidgetData.sport)
        .replace("{{LEAGUE}}", this.fullWidgetData.league)
        .replace("{{FEEDTYPE}}", this.valuesToReplace.FEEDTYPE)
        .replace("{{FEEDVALUE}}", this.valuesToReplace.FEEDVALUE);
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
    this.marketDataArray = data.bettingOdds.matches;
    const widgetParsedData = {
      matches: [],
      sport: this.fullWidgetData.sport,
      team: this.fullWidgetData.team,
      tournament: this.fullWidgetData.tournament,
      sportsArray: this.fullWidgetData.sportsArray,
      selectedLeague: this.fullWidgetData.league,
      selectedSportName: this.fullWidgetData.sportInfo.name,
      selectedLeagueName: this.fullWidgetData.selectedLeagueName,
      selectedSportInfo: this.fullWidgetData.sportInfo,
      meta: { extraclass: this.fullWidgetData.extraClass, show_widget_title: this.titleElem, widgetTitleTag: this.titleData.tag },
      displayTitle: this.titleData.displayTitle,
      widgetTitleTag: this.titleData.tag,
      hasLeagueFilter: this.fullWidgetData.hasLeagueFilter,
      oddsLink: this.fullWidgetData.oddsLink,
      partnerLogo: this.fullWidgetData.partnerLogo,
      applicationDomain: window.location.origin
    };

    let clientCache = {
      customNames: { en: window.SIWidget.customNames },
      translations: { en: window.SIWidget.translations }
    };

    let customNames = clientCache.customNames;
    widgetParsedData.matches = this.parseMatchesData(data.multiSport.matches, this.marketDataArray, customNames[this.selectedLang], true);

    widgetParsedData.openSportDD = false;
    widgetParsedData.openLeagueDD = false;
    widgetParsedData.showMarketInfo = false;
    widgetParsedData.footballScoreCardMapper = this.config.footballScoreCardMapper;

    let vueInstance = new Vue(render);
    vueInstance.widgetData = widgetParsedData;
    vueInstance.imagePaths = this.config.imagePaths;
    vueInstance.configData = { content: { playerImg: window.imgVersion } };
    this.widgetConfig.container.innerHTML = "";

    vueInstance.$mount(this.widgetConfig.container, true);

    vueInstance.selectedLang = self.selectedLang;
    vueInstance.getNewSportLeagueData = function() {
      let league = this.widgetData.leagueInfo && this.widgetData.leagueInfo.league_code ? this.widgetData.leagueInfo.league_code : "0";
      let feedType = this.widgetData.team ? "team" : this.widgetData.tournament ? "tournament" : "gamestate";
      let feedValue = this.widgetData.team ? this.widgetData.team : this.widgetData.tournament ? this.widgetData.tournament : "4";
      let requestUrl = self.widgetConfig.apis.multiSport
        .replace("{{LANG}}", self.selectedLang)
        .replace("{{SPORT}}", this.widgetData.sport)
        .replace("{{LEAGUE}}", league)
        .replace("{{FEEDTYPE}}", feedType)
        .replace("{{FEEDVALUE}}", feedValue);

      self.commonFunctions
        .apiCall(requestUrl, { isJSON: true })
        .then(response => {
          this.lazyLoaded = true;
          let oddsApi = self.widgetConfig.odds[this.widgetData.sport];
          this.widgetData.oddsLink =
            this.widgetData.leagueInfo && this.widgetData.leagueInfo.odds_link
              ? this.widgetData.leagueInfo.odds_link
              : this.widgetData.selectedSportInfo.odds_link
              ? this.widgetData.selectedSportInfo.odds_link
              : "";
          this.widgetData.partnerLogo =
            this.widgetData.leagueInfo && this.widgetData.leagueInfo.partner_logo
              ? this.widgetData.leagueInfo.partner_logo
              : this.widgetData.selectedSportInfo.partner_logo
              ? this.widgetData.selectedSportInfo.partner_logo
              : "";
          self.commonFunctions
            .apiCall(oddsApi, { isJSON: true })
            .then(oddsResponse => {
              self.marketDataArray = oddsResponse.matches;
              this.widgetData.matches = self.parseMatchesData(response.matches, self.marketDataArray, window.SIWidget.customNames, true);
              self.startUpdates(self, vueInstance);
            })
            .catch(e => {
              this.widgetData.matches = self.parseMatchesData(response.matches, self.marketDataArray, window.SIWidget.customNames, true);
              self.startUpdates(self, vueInstance);
            });
        })
        .catch(err => {
          console.log(err);
        });
    };
    this.cricketCallBackRegistered = false;
    this.startUpdates(this, vueInstance);
    this.startMarketRotation(vueInstance);
  }
  parseMatchesData(matchesArray, marketDataArray = [], customNames, sort = true) {
    return scoreStripDataParser({ matches: matchesArray, marketDataArray, utils, customNames });
  }
  updateByPushPoll(resParams, resp, isPush) {
    let { self } = resParams;
    let vueInstanceRef = resParams.vueInstance;
    let tempMatchesArray = [];
    vueInstanceRef.lazyLoaded = true;
    if (isPush) {
      vueInstanceRef.widgetData.updatingByPush = true;
      vueInstanceRef.widgetData.matches.forEach(oldMatchData => {
        if (oldMatchData.game_id === resp.game_id) {
          resp = self.updateNewMatchNodeForCustomNames(oldMatchData, resp);

          oldMatchData = Object.assign({}, oldMatchData, resp);
        }
        tempMatchesArray.push(oldMatchData);
      });
      vueInstanceRef.widgetData.matches = tempMatchesArray;
      return;
    }
    for (var i = 0; i < resp.matches.length; i++) {
      tempMatchesArray = [];
      for (var j = 0; j < vueInstanceRef.widgetData.matches.length; j++) {
        if (resp.matches[i].game_id === vueInstanceRef.widgetData.matches[j].game_id) {
          resp.matches[i] = self.updateNewMatchNodeForCustomNames(vueInstanceRef.widgetData.matches[j], resp.matches[i]);
          // resp.matches[i].streamAvailable = vueInstanceRef.widgetData.matches[j].streamAvailable;
          vueInstanceRef.widgetData.matches[j] = resp.matches[i];
        }
        tempMatchesArray.push(vueInstanceRef.widgetData.matches[j]);
      }
    }
    vueInstanceRef.widgetData.matches = tempMatchesArray;

    let liveMatches = [],
      upcomingMatches = [],
      recentMatches = [],
      isFirst = true;

    vueInstanceRef.widgetData.matches.forEach(matchData => {
      if (matchData.event_state === "L") {
        liveMatches.push(matchData);
      } else if (matchData.event_state === "U") {
        // if (isFirst) {
        //   isFirst = false;
        //   matchData.event_state = "L";
        //   matchData.event_priority = "1";
        //   liveMatches.push(matchData);
        // } else {
        upcomingMatches.push(matchData);
        // }
      } else {
        recentMatches.push(matchData);
      }
    });

    liveMatches.sort((a, b) => {
      if (a.event_priority !== b.event_priority) {
        if (!a.event_priority) {
          return 1;
        }
        if (a.event_priority && b.event_priority) {
          return +a.event_priority - +b.event_priority;
        }
      }
      return 0;
    });

    vueInstanceRef.widgetData.matches = liveMatches.concat(upcomingMatches, recentMatches);
  }
  updateData(resParams, resp, isPush) {
    let tempMatchesArray = [];
    let vueInstanceRef = resParams.vueInstance;
    let self = resParams.self;

    if (isPush) {
      vueInstanceRef.widgetData.matches.forEach(oldMatchData => {
        if (oldMatchData.game_id === resp.game_id) {
          oldMatchData = Object.assign({}, oldMatchData, resp);
        }
        tempMatchesArray.push(oldMatchData);
      });
      vueInstanceRef.widgetData.matches = tempMatchesArray;
      return;
    }

    tempMatchesArray = [];
    for (var j = 0; j < vueInstanceRef.widgetData.matches.length; j++) {
      // let matchFound = false;
      for (var i = 0; i < resp.matches.length; i++) {
        if (resp.matches[i].game_id === vueInstanceRef.widgetData.matches[j].game_id) {
          let marketInfo = vueInstanceRef.widgetData.matches[j].marketInfo;
          vueInstanceRef.widgetData.matches[j] = resp.matches[i];
          vueInstanceRef.widgetData.matches[j].marketInfo = marketInfo;
          // tempMatchesArray.push(vueInstanceRef.widgetData.matches[j]);
          // matchFound = true;
        }
      }
      // if (!matchFound) {
      tempMatchesArray.push(vueInstanceRef.widgetData.matches[j]);
      // }
    }
    vueInstanceRef.widgetData.matches = self.parseMatchesData(tempMatchesArray, self.marketDataArray, window.SIWidget.customNames, false);
  }
  updateNewMatchNodeForCustomNames(oldMatchData, newMatchData) {
    // if (oldMatchData.marketInfo) {
    //   newMatchData.marketInfo = oldMatchData.marketInfo;
    // }
    newMatchData.customTourName = oldMatchData.customTourName;
    if (newMatchData.participants && newMatchData.participants.length && oldMatchData.participants && oldMatchData.participants.length) {
      newMatchData.participants[0].customName = oldMatchData.participants[0].customName;
      newMatchData.participants[1].customName = oldMatchData.participants[1].customName;
      newMatchData.participants[0].customShortName = oldMatchData.participants[0].customShortName;
      newMatchData.participants[1].customShortName = oldMatchData.participants[1].customShortName;
    }
    if (newMatchData.market) {
      newMatchData.marketInfo = newMatchData.market;
    }
    if (newMatchData.participants && newMatchData.participants[0] && newMatchData.participants[1])
      newMatchData.customStatus = newMatchData.event_sub_status
        .replace(newMatchData.participants[0].name, newMatchData.participants[0].customName)
        .replace(newMatchData.participants[1].name, newMatchData.participants[1].customName);
    return newMatchData;
  }
  getDataByPolling(reqParams) {
    let vueInstanceRef = reqParams.vueInstance;
    let { self } = reqParams;
    let requestUrl = self.widgetConfig.apis.multiSport
      .replace("{{LANG}}", self.selectedLang)
      .replace("{{SPORT}}", vueInstanceRef.widgetData.sport)
      .replace(
        "{{LEAGUE}}",
        vueInstanceRef.widgetData.leagueInfo && vueInstanceRef.widgetData.leagueInfo.league_code
          ? vueInstanceRef.widgetData.leagueInfo.league_code
          : "0"
      )
      .replace("{{FEEDTYPE}}", "gamestate")
      .replace("{{FEEDVALUE}}", "4");
    let resp = { matches: [] };
    self.commonFunctions
      .apiCall(requestUrl, { isJSON: true })
      .then(response => {
        this.updateByPushPoll(reqParams, response);
      })
      .catch(err => {
        console.log(err);
      });
  }
  startUpdates(self, vueInstance) {
    let reqParams = { vueInstance, self };
    if (self.globalTimer) clearInterval(self.globalTimer);
    if (self.oddsTimerForPush) clearInterval(self.oddsTimerForPush);
    if (self.callBackId) self.commonFunctions.removeCallBack(self.callBackId);
    if (self.config.refreshInterval) {
      self.globalTimer = setInterval(() => {
        if (vueInstance.widgetData.sport === 1 && !self.cricketCallBackRegistered) {
          self.cricketCallBackRegistered = true;
          self.callBackId = self.commonFunctions.getMatchesData(reqParams, self.updateByPushPoll);
        } else if (vueInstance.widgetData.sport !== 1) {
          self.getDataByPolling(reqParams, self.fullWidgetData.sport);
        }
      }, self.config.refreshInterval * 1000);

      self.oddsTimerForPush = setInterval(() => {
        if (vueInstance.widgetData.sport === 1 && vueInstance.widgetData.updatingByPush) {
          self.getDataByPolling(reqParams, self.fullWidgetData.sport);
        }
      }, self.config.refreshInterval * 1000);
    }
  }
  startMarketRotation(vueInstance) {
    setInterval(() => {
      vueInstance.widgetData.showMarketInfo = !vueInstance.widgetData.showMarketInfo;
    }, 10 * 1000);
  }
};

window.SIWidget.SIClass = window.SIWidget.SIClass || {};
window.SIWidget.SIClass["fixtureStrip"] = SIClass;
