var infiniteScroll = require("vue-infinite-scroll");
import render from "./../../../components/si-fixtures/widget-layout-01.vue";
const {
  monthsList,
  getYearMonthObj,
  getClosestMonth,
  getTeamCustomName,
  getTourCustomName,
  getCustomStatus,
  splitMatchesAndAds
} = require("./../../../sdk/WidgetLibrary/utils");
// const { getTeamCustomName, getTourCustomName, getCustomStatus, splitMatchesAndAds } = require("./../../../sdk/WidgetLibrary/utils");
const utils = { monthsList, getYearMonthObj, getClosestMonth, getTeamCustomName, getTourCustomName, getCustomStatus, splitMatchesAndAds };
// const { fixturesPagePreParser, fixturesPageDataParser } = require("./../../../sdk/WidgetLibrary/clientServerCommon.js");

const SIClass = class {
  constructor(config, VueLib, widgetConfig, commonFunctions) {
    this.config = config;
    this.Vue = VueLib;
    this.widgetConfig = widgetConfig;
    this.selectedLang = "en";
    this.commonFunctions = commonFunctions;
    this.serverData = widgetConfig.container.getAttribute("server-data");
    this.serverData = JSON.parse(this.serverData);
    this.teamId = widgetConfig.container.getAttribute(".team-id");
    this.teamName = widgetConfig.container.getAttribute(".team-name");
    this.tournamentId = widgetConfig.container.getAttribute(".tournament-id");
    this.tournamentName = widgetConfig.container.getAttribute(".tournament-name");
    this.titleElem = widgetConfig.container.querySelector(".title");
    this.titleData = {
      tag: this.titleElem ? this.titleElem.tagName.toLowerCase() : "",
      displayTitle: this.titleElem ? this.titleElem.innerText : ""
    };
    this.isMobile = widgetConfig.container.getAttribute("is-mobile") === "0" ? 0 : 1;
  }
  init() {
    if (window.fixtureWidgetData.configData) {
      window.fixtureWidgetData.configData.showTeamFilter = true;
      if (window.fixtureWidgetData.configData.teamsArray) {
        window.fixtureWidgetData.configData.teamsArray = window.fixtureWidgetData.configData.teamsArray.sort((a, b) => {
          if (a.team_name < b.team_name) {
            return -1;
          }
          if (a.team_name > b.team_name) {
            return 1;
          }
          return 0;
        });
      }
      if (window.fixtureWidgetData.configData.tournamentsArray) {
        window.fixtureWidgetData.configData.tournamentsArray = window.fixtureWidgetData.configData.tournamentsArray.sort((a, b) => {
          if (a.tour_name < b.tour_name) {
            return -1;
          }
          if (a.tour_name > b.tour_name) {
            return 1;
          }
          return 0;
        });
      }

      if (
        // window.fixtureWidgetData.configData.selectedSportId === 1 &&
        window.fixtureWidgetData.configData.selectedTeamId ||
        window.fixtureWidgetData.configData.selectedTournamentId
      ) {
        let dateList = [];
        window.fixtureWidgetData.allMatches.forEach(matchData => {
          let matchStartDtArray = matchData.start_date.split("T")[0].split("-");
          let matchFormattedStartDt = matchStartDtArray[2] + matchStartDtArray[1] + matchStartDtArray[0];
          if (!dateList.includes(matchFormattedStartDt)) {
            dateList.push(matchFormattedStartDt);
          }
        });
        window.fixtureWidgetData.configData.monthsArray = utils.monthsList(dateList);
        window.fixtureWidgetData.configData.yearAndMonthObj = utils.getYearMonthObj(window.fixtureWidgetData.configData.monthsArray);
        if (window.fixtureWidgetData.configData.yearAndMonthObj && window.fixtureWidgetData.configData.yearAndMonthObj.yearArray)
          window.fixtureWidgetData.configData.yearAndMonthObj.yearArray = window.fixtureWidgetData.configData.yearAndMonthObj.yearArray.filter(
            year => +year >= +window.fixtureWidgetData.configData.minMatchYear
          );
        // window.fixtureWidgetData.configData.selectedMonthObj = utils.getClosestMonth(window.fixtureWidgetData.configData.monthsArray);
      }
    }

    this.preParsedData = window.fixtureWidgetData.configData;

    window.fixtureWidgetData.liveCardListsBackup = window.fixtureWidgetData.liveCardLists.slice();
    window.fixtureWidgetData.recentCardListsBackup = window.fixtureWidgetData.recentCardLists.slice();
    window.fixtureWidgetData.upcomingCardListsBackup = window.fixtureWidgetData.upcomingCardLists.slice();

    window.fixtureWidgetData.liveCardLists.length =
      window.fixtureWidgetData.liveCardLists.length > 3 ? 3 : window.fixtureWidgetData.liveCardLists.length;
    window.fixtureWidgetData.recentCardLists.length =
      window.fixtureWidgetData.recentCardLists.length > 3 ? 3 : window.fixtureWidgetData.recentCardLists.length;
    window.fixtureWidgetData.upcomingCardLists.length =
      window.fixtureWidgetData.upcomingCardLists.length > 3 ? 3 : window.fixtureWidgetData.upcomingCardLists.length;

    this.mountMarkup(window.fixtureWidgetData);
    this.getOddsData();
    // this.hydration();
  }
  getOddsData() {
    let requestUrl = this.widgetConfig.odds[window.fixtureWidgetData.configData.selectedSportId];
    this.commonFunctions
      .apiCall(requestUrl, { isJSON: true })
      .then(response => {
        window.SIWidget.oddsFeed = response;
      })
      .catch(err => {
        console.log(err);
      });
  }
  hydration() {
    let inputData = this.serverData;
    this.widgetConfigCopy = JSON.parse(JSON.stringify(this.widgetConfig));
    this.preParsedData = fixturesPagePreParser(inputData, this.widgetConfigCopy);
    this.getWidgetData()
      .then(widgetData => {
        let selectorData = {};
        selectorData.title = this.titleData.displayTitle;
        selectorData.dataToPass = this.serverData;
        selectorData.widgetData = { apis: widgetData };
        selectorData.widgetParsedData = this.preParsedData;

        let responseObj = fixturesPageDataParser(selectorData, {
          customNames: window.SIWidget.customNames,
          utils,
          extraClass: this.serverData.extraClass,
          isClient: true
        });
        responseObj.applicationDomain = window.location.origin;
        this.mountMarkup(responseObj);
      })
      .catch(e => {
        console.log(e);
      });
  }
  getWidgetData() {
    let promiseArray = [];
    let responseData = {};

    let valuesToReplace = {
      FEEDTYPE: this.preParsedData.feedType,
      FEEDVALUE: this.preParsedData.feedValue,
      SPORT: this.preParsedData.selectedSportId,
      LANG: this.selectedLang,
      LEAGUECODE: this.preParsedData.selectedLeagueCode,
      SERIESID: this.preParsedData.seriesId
    };

    this.preParsedData.preApis = JSON.stringify(this.preParsedData.preApis);
    Object.keys(valuesToReplace).forEach(key => {
      let rep_regex = new RegExp(`{{${key}}}`, "gi");
      this.preParsedData.preApis = this.preParsedData.preApis.replace(rep_regex, valuesToReplace[key]);
    });
    this.preParsedData.preApis = JSON.parse(this.preParsedData.preApis);
    const apisToHit = this.preParsedData.preApis;

    Object.keys(apisToHit).forEach(key => {
      let requestUrl = apisToHit[key];
      let promiseData = this.commonFunctions
        .apiCall(requestUrl, { isJSON: true })
        .then(response => {
          this.preParsedData.preFetchedData[key] = response;
        })
        .catch(err => {
          console.log(err);
        });
      promiseArray.push(promiseData);
    });
    return new Promise((resolve, reject) => {
      Promise.all(promiseArray)
        .then(data => {
          promiseArray = [];
          delete this.widgetConfigCopy.apis.dateList;
          delete this.widgetConfigCopy.apis.teamTourList;

          if (this.preParsedData.preFetchedData && this.preParsedData.preFetchedData.dateList) {
            this.preParsedData.monthsArray = utils.monthsList(this.preParsedData.preFetchedData.dateList.dates);
            this.preParsedData.yearAndMonthObj = utils.getYearMonthObj(this.preParsedData.monthsArray);
            this.preParsedData.selectedMonthObj = utils.getClosestMonth(this.preParsedData.monthsArray);
            valuesToReplace.FEEDVALUE = this.preParsedData.selectedMonthObj.dateRange;
          }

          let requestUrls = [];
          let requestUrl2 = this.widgetConfigCopy.apis.multiSport;
          if (!window.SIWidget.oddsFeed) {
            requestUrls.push(this.widgetConfigCopy.odds[this.preParsedData.selectedSportId]);
          }
          Object.keys(valuesToReplace).forEach(key => {
            requestUrl2 = requestUrl2.replace(`{{${key}}}`, valuesToReplace[key]);
          });
          requestUrls.push(requestUrl2);
          requestUrls.forEach(reqUrl => {
            promiseArray.push(this.commonFunctions.apiCall(reqUrl, { isJSON: true }));
          });
          Promise.all(promiseArray).then(data => {
            if (data.length === 2) {
              responseData.multiSport = data[1];
              window.SIWidget.oddsFeed = data[0];
              resolve(responseData);
            } else {
              responseData.multiSport = data[0];
              resolve(responseData);
            }
          });
        })
        .catch(e => {
          console.log(e);
        });
    });
  }
  mountMarkup(widgetData) {
    render.directives = { infiniteScroll };
    let self = this;
    widgetData.footballScoreCardMapper = this.config.footballScoreCardMapper;
    let vueInstance = new Vue(render);
    vueInstance.widgetData = widgetData;
    vueInstance.widgetData.isMobile = this.isMobile;
    vueInstance.imagePaths = this.config.imagePaths;
    vueInstance.busy = false;
    vueInstance.selectedLang = self.selectedLang;
    vueInstance.configData = { content: { playerImg: window.imgVersion } };
    this.widgetConfig.container.innerHTML = "";

    let container;
    document.querySelectorAll(".si-waf-widget").forEach(el => {
      if (el.hasAttribute("widget-id") && el.getAttribute("widget-id") === "si-fixtures-widget-layout-01") {
        container = el;
      }
    });
    vueInstance.$mount(container, true);
    // vueInstance.lazyLoaded = false;
    setTimeout(() => {
      window.adModule({ type: "fixturesPage" });
      // vueInstance.lazyLoaded = true;
    }, 1500);

    vueInstance.leagueSelection = function(leagueData) {
      this.widgetData.configData.showLeaguesDD = false;
      let selectedLeagueCode = leagueData.league_code;
      self.serverData.data.forEach(sportData => {
        if (sportData.leagues && sportData.leagues.length) {
          sportData.leagues.forEach(leagueData => {
            if (leagueData.league_code === selectedLeagueCode) {
              leagueData.is_default = true;
            } else {
              leagueData.is_default = false;
            }
          });
        }
      });
      this.widgetData.configData.selectedLeague = leagueData;
      if (self.footballKabaddiPollingTimer) clearInterval(self.footballKabaddiPollingTimer);
      if (self.callBackId) self.commonFunctions.removeCallBack(self.callBackId);
      self.init();
    };

    vueInstance.tabSelection = function(tab) {
      this.busy = false;
      // this.widgetData.liveCardLists.length = this.widgetData.liveCardLists.length ? 3 : this.widgetData.liveCardLists.length;
      this.widgetData.upcomingCardLists.length = this.widgetData.upcomingCardLists.length > 3 ? 3 : this.widgetData.upcomingCardLists.length;
      this.widgetData.recentCardLists.length = this.widgetData.recentCardLists.length > 3 ? 3 : this.widgetData.recentCardLists.length;

      Array.from(document.querySelectorAll(".si-waf-widget.waf-fixtures img.lazyloaded")).forEach(imgElem => {
        imgElem.classList.remove("lazyloaded");
        imgElem.classList.add("lazy");
      });
      this.widgetData.configData.tabs.forEach(tabData => {
        if (tabData.name === tab.name) {
          tabData.is_default = true;
        } else {
          tabData.is_default = false;
        }
      });
      this.widgetData.configData.currentTabObj = tab;
      self.serverData.tabs_data = this.widgetData.configData.tabs;

      // vueInstance.commonParsing(tab, false);
      setTimeout(() => {
        window.adModule({ type: "fixturesPage" });
      }, 1500);
      // vueInstance.lazyLoaded = false;
    };
    window.vueInstance = vueInstance;
    vueInstance.monthSelection = function(selectedMonthInfo, type) {
      this.widgetData.configData.showMonthsDD = false;
      this.widgetData.configData.showYearsDD = false;
      this.widgetData.configData.showMonthsNewDD = false;

      if (type === "year" && selectedMonthInfo) {
        // Call Year wise File For Populating the Tournament and Teams DD
      }

      if (type === "year" && !selectedMonthInfo) {
        if (this.widgetData.configData.selectedTournamentId) {
          vueInstance.tournamentSelection({
            tour_id: this.widgetData.configData.selectedTournamentId,
            tour_name: this.widgetData.configData.selectedTournamentName
          });
        } else {
          vueInstance.teamSelection({
            team_id: this.widgetData.configData.selectedTeamId,
            team_name: this.widgetData.configData.selectedTeamName
          });
        }
        return;
      } else if (type === "year") {
        let year = selectedMonthInfo;
        let monthListAsPerYear = this.widgetData.configData.yearAndMonthObj.monthsObj[year];
        this.widgetData.configData.selectedMonthObj = utils.getClosestMonth(monthListAsPerYear);
        selectedMonthInfo = this.widgetData.configData.selectedMonthObj;
      } else {
        this.widgetData.configData.selectedMonthObj = selectedMonthInfo;
      }

      let api = self.widgetConfig.apis.multiSport
        .replace("{{FEEDTYPE}}", "daterange")
        .replace("{{FEEDVALUE}}", selectedMonthInfo.dateRange)
        .replace("{{SPORT}}", this.widgetData.configData.selectedSportId)
        .replace("{{LEAGUECODE}}", this.widgetData.configData.selectedLeagueCode)
        .replace("{{LANG}}", self.selectedLang);
      self.commonFunctions
        .apiCall(api, { isJSON: true })
        .then(resp => {
          this.widgetData.allMatches = resp.matches;
          if (this.widgetData.configData.selectedTournamentId || this.widgetData.configData.selectedTeamId) {
            this.widgetData.allMatches = this.widgetData.allMatches.filter(matchData => {
              if (
                (this.widgetData.configData.selectedTournamentId && +matchData.tour_id === +this.widgetData.configData.selectedTournamentId) ||
                (this.widgetData.configData.selectedTeamId &&
                  (+this.widgetData.configData.selectedTeamId === +matchData.participants[0].id ||
                    +this.widgetData.configData.selectedTeamId === +matchData.participants[1].id))
              ) {
                return true;
              }
              return false;
            });
          }
          let tab = this.widgetData.configData.tabs.find(tabData => tabData.is_default);
          vueInstance.commonParsing(tab);
          // if (widgetData.liveCardLists && this.widgetData.liveCardLists.length && this.widgetData.liveCardLists[0].matches.length) {
          //   this.widgetData.configData.currentTabObj = this.widgetData.configData.tabs.find(tabData => tabData.name.toLowerCase() === "live");
          // } else if (
          //   this.widgetData.upcomingCardLists &&
          //   this.widgetData.upcomingCardLists.length &&
          //   this.widgetData.upcomingCardLists[0].matches.length
          // ) {
          //   this.widgetData.configData.currentTabObj = this.widgetData.configData.tabs.find(tabData => tabData.name.toLowerCase() === "upcoming");
          // } else {
          //   this.widgetData.configData.currentTabObj = this.widgetData.configData.tabs.find(tabData => tabData.name.toLowerCase() === "recent");
          // }
        })
        .catch(e => {});
    };

    vueInstance.tournamentSelection = function(tourInfo) {
      // this.widgetData.configData.lockMonthsDD = true;
      this.widgetData.configData.selectedMonthObj = {};
      this.widgetData.configData.showTournamentsDD = false;
      this.widgetData.configData.selectedTournamentId = tourInfo.tour_id;
      this.widgetData.configData.selectedTournamentName = tourInfo.tour_name;

      this.widgetData.configData.selectedTeamId = "";
      this.widgetData.configData.selectedTeamName = "";

      let multiSportApi = self.widgetConfig.apis.multiSport
        .replace("{{FEEDTYPE}}", "tournament")
        .replace("{{FEEDVALUE}}", this.widgetData.configData.selectedTournamentId)
        .replace("{{SPORT}}", this.widgetData.configData.selectedSportId)
        .replace("{{LEAGUECODE}}", this.widgetData.configData.selectedLeagueCode)
        .replace("{{LANG}}", self.selectedLang);
      self.commonFunctions
        .apiCall(multiSportApi, { isJSON: true })
        .then(resp => {
          this.widgetData.allMatches = resp.matches;
          let tab = this.widgetData.configData.tabs.find(tabData => tabData.is_default);
          vueInstance.commonParsing(tab);
        })
        .catch(e => {});
    };

    vueInstance.teamSelection = function(teamInfo) {
      // this.widgetData.configData.lockMonthsDD = true;
      this.widgetData.configData.selectedMonthObj = {};
      this.widgetData.configData.showTeamsDD = false;
      this.widgetData.configData.selectedTeamId = teamInfo.team_id;
      this.widgetData.configData.selectedTeamName = teamInfo.team_name;

      this.widgetData.configData.selectedTournamentId = "";
      this.widgetData.configData.selectedTournamentName = "";

      let multiSportApi = self.widgetConfig.apis.multiSport
        .replace("{{FEEDTYPE}}", "teamcode")
        .replace("{{FEEDVALUE}}", this.widgetData.configData.selectedTeamId)
        .replace("{{SPORT}}", this.widgetData.configData.selectedSportId)
        .replace("{{LEAGUECODE}}", this.widgetData.configData.selectedLeagueCode)
        .replace("{{LANG}}", self.selectedLang);
      self.commonFunctions
        .apiCall(multiSportApi, { isJSON: true })
        .then(resp => {
          this.widgetData.allMatches = resp.matches;
          // .filter(matchData=>{
          //   if(window.fixtureWidgetData.configData && window.fixtureWidgetData.configData.minMatchYear){

          //   }else{
          //     return true
          //   }
          // });
          let tab = this.widgetData.configData.tabs.find(tabData => tabData.is_default);
          vueInstance.commonParsing(tab);
        })
        .catch(e => {});
    };

    vueInstance.commonParsing = function(tab, reCalculateTabSelection = true) {
      let liveMatches = [];
      let recentMatches = [];
      let upcomingMatches = [];
      let customNames = window.SIWidget.customNames;
      this.widgetData.allMatches = this.widgetData.allMatches.filter(matchData => {
        let matchYear = +matchData.start_date.split("-")[0];
        return matchYear >= +this.widgetData.configData.minMatchYear;
        // return matchYear > 2018;
      });
      this.widgetData.allMatches.forEach((matchData, i) => {
        matchData.participants[0].customName =
          utils.getTeamCustomName({ id: matchData.participants[0].id, customNames, sportName: matchData.sport, type: "full" }) ||
          matchData.participants[0].name;
        matchData.participants[1].customName =
          utils.getTeamCustomName({ id: matchData.participants[1].id, customNames, sportName: matchData.sport, type: "full" }) ||
          matchData.participants[1].name;

        matchData.participants[0].customShortName =
          utils.getTeamCustomName({ id: matchData.participants[0].id, customNames, sportName: matchData.sport, type: "short" }) ||
          matchData.participants[0].short_name;
        matchData.participants[1].customShortName =
          utils.getTeamCustomName({ id: matchData.participants[1].id, customNames, sportName: matchData.sport, type: "short" }) ||
          matchData.participants[1].short_name;

        matchData.customTourName =
          utils.getTourCustomName({ tourId: matchData.tour_id, customNames, sportName: matchData.sport }) || matchData.tour_name;

        matchData.customStatus = utils.getCustomStatus({
          matchNode: matchData,
          customNames
        });

        if (matchData.event_state === "L") {
          liveMatches.push(matchData);
        } else if (matchData.event_state === "R") {
          recentMatches.push(matchData);
        } else if (matchData.event_state === "U") {
          upcomingMatches.push(matchData);
        }

        if (window.SIWidget.oddsFeed && window.SIWidget.oddsFeed.matches) {
          let matchesWithOdds = window.SIWidget.oddsFeed.matches;
          let marketData = matchesWithOdds.find(matchDataWithOdds => matchDataWithOdds.game_id === matchData.game_id);
          if (marketData) {
            matchData.market = marketData.market;
          }
        }
      });
      this.widgetData.liveMatches = liveMatches;
      this.widgetData.recentMatches = recentMatches;
      this.widgetData.upcomingMatches = upcomingMatches;
      this.widgetData.recentMatches.reverse();

      let cardLists = [];
      if (this.widgetData.matches && this.widgetData.matches.length) {
        let counter = 0;
        let maxCount = Math.ceil(this.widgetData.matches.length / this.widgetData.configData.adsAfter);
        for (let i = 0; i < maxCount; i++) {
          cardLists[i] = {
            matches: [],
            adObj: {}
          };

          for (let j = 0; j < this.widgetData.configData.adsAfter; j++) {
            if (this.widgetData.matches[counter]) {
              cardLists[i].matches.push(this.widgetData.matches[counter]);
              counter++;
            }
          }
          cardLists[i].adObj = { adCode: self.serverData.adCode };
        }
      } else {
        cardLists[0] = {
          matches: [],
          adObj: { adCode: self.serverData.adCode }
        };
      }

      this.widgetData.liveCardLists = utils.splitMatchesAndAds(
        this.widgetData.liveMatches,
        this.widgetData.configData.adsAfter,
        self.serverData.adCode
      );

      this.widgetData.recentCardLists = utils.splitMatchesAndAds(
        this.widgetData.recentMatches,
        this.widgetData.configData.adsAfter,
        self.serverData.adCode
      );

      this.widgetData.upcomingCardLists = utils.splitMatchesAndAds(
        this.widgetData.upcomingMatches,
        this.widgetData.configData.adsAfter,
        self.serverData.adCode
      );

      this.widgetData.liveCardListsBackup = this.widgetData.liveCardLists.slice();
      this.widgetData.recentCardListsBackup = this.widgetData.recentCardLists.slice();
      this.widgetData.upcomingCardListsBackup = this.widgetData.upcomingCardLists.slice();

      this.widgetData.liveCardLists.length = this.widgetData.liveCardLists.length > 3 ? 3 : this.widgetData.liveCardLists.length;
      this.widgetData.recentCardLists.length = this.widgetData.recentCardLists.length > 3 ? 3 : this.widgetData.recentCardLists.length;
      this.widgetData.upcomingCardLists.length = this.widgetData.upcomingCardLists.length > 3 ? 3 : this.widgetData.upcomingCardLists.length;

      if (reCalculateTabSelection) {
        if (this.widgetData.liveCardLists && this.widgetData.liveCardLists.length && this.widgetData.liveCardLists[0].matches.length) {
          this.widgetData.configData.currentTabObj = this.widgetData.configData.tabs.find(tabData => tabData.name.toLowerCase() === "live");
        } else if (
          this.widgetData.upcomingCardLists &&
          this.widgetData.upcomingCardLists.length &&
          this.widgetData.upcomingCardLists[0].matches.length
        ) {
          this.widgetData.configData.currentTabObj = this.widgetData.configData.tabs.find(tabData => tabData.name.toLowerCase() === "upcoming");
        } else {
          this.widgetData.configData.currentTabObj = this.widgetData.configData.tabs.find(tabData => tabData.name.toLowerCase() === "recent");
        }
      }
    };

    let reqParams = { vueInstance, self };

    if (this.preParsedData.selectedSportId === 1) {
      this.callBackId = this.commonFunctions.getMatchesData(reqParams, this.updateByPushPoll);

      if (this.oddsTimerForPush) clearInterval(this.oddsTimerForPush);
      this.oddsTimerForPush = setInterval(() => {
        if (vueInstance.widgetData.updatingByPush) {
          this.commonFunctions
            .apiCall(this.config.intervalApi, { isJSON: true })
            .then(response => {
              this.updateByPushPoll(reqParams, response, false);
            })
            .catch(err => {
              console.log(err);
            });
        }
      }, this.config.refreshInterval * 1000);
    } else {
      this.footballKabaddiPollingTimer = setInterval(() => {
        this.startPollingForKabaddiOrFootball(reqParams);
      }, this.config.refreshInterval * 1000);
    }
  }
  updateByPushPoll(resParams, resp, isPush) {
    let { self } = resParams;
    let vueInstanceRef = resParams.vueInstance;
    if (isPush) {
      vueInstanceRef.widgetData.updatingByPush = true;
      vueInstanceRef.widgetData.recentCardLists = self.updateCardList(vueInstanceRef.widgetData.recentCardLists, resp, self);
      vueInstanceRef.widgetData.upcomingCardLists = self.updateCardList(vueInstanceRef.widgetData.upcomingCardLists, resp, self);
      vueInstanceRef.widgetData.liveCardLists = self.updateCardList(vueInstanceRef.widgetData.liveCardLists, resp, self);
      return;
    }
    for (var i = 0; i < resp.matches.length; i++) {
      vueInstanceRef.widgetData.recentCardLists = self.updateCardList(vueInstanceRef.widgetData.recentCardLists, resp.matches[i], self);
      vueInstanceRef.widgetData.upcomingCardLists = self.updateCardList(vueInstanceRef.widgetData.upcomingCardLists, resp.matches[i], self);
      vueInstanceRef.widgetData.liveCardLists = self.updateCardList(vueInstanceRef.widgetData.liveCardLists, resp.matches[i], self);
    }
  }
  updateCardList(cardList, newMatchData, self) {
    if (cardList && cardList.length) {
      cardList.forEach(carListData => {
        let tempArray = [];
        carListData.matches.forEach(oldMatchData => {
          if (oldMatchData.game_id === newMatchData.game_id) {
            newMatchData = self.updateNewMatchNodeForCustomNames(oldMatchData, newMatchData);
            oldMatchData = Object.assign({}, oldMatchData, newMatchData);
          }
          tempArray.push(oldMatchData);
        });
        carListData.matches = tempArray;
      });
    }
    return cardList;
  }
  startPollingForKabaddiOrFootball(reqParams) {
    const requestUrl = this.widgetConfig.apis.multiSport
      .replace("{{LEAGUECODE}}", "0")
      .replace("{{LANG}}", "en")
      .replace("{{SPORT}}", this.preParsedData.selectedSportId)
      .replace("{{FEEDTYPE}}", "gamestate")
      .replace("{{FEEDVALUE}}", "4");
    this.commonFunctions
      .apiCall(requestUrl, { isJSON: true })
      .then(response => {
        this.updateByPushPoll(reqParams, response);
      })
      .catch(err => {
        console.log(err);
      });
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
      newMatchData.customStatus = newMatchData.event_sub_status
        .replace(newMatchData.participants[0].name, newMatchData.participants[0].customName)
        .replace(newMatchData.participants[1].name, newMatchData.participants[1].customName);
    }
    if (newMatchData.market) {
      newMatchData.market = newMatchData.market;
    }
    return newMatchData;
  }
};
window.SIWidget.SIClass = window.SIWidget.SIClass || {};
window.SIWidget.SIClass["fixtures"] = SIClass;
