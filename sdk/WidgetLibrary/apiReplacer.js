"use strict";
const utils = require("./utils");
const commonParsers = require("./clientServerCommon");

const apiReplacer = {
  commonReplacer: ({ urlObj, valuesToReplace, pageInfo }) => {
    let urlString = JSON.stringify(urlObj);
    Object.keys(valuesToReplace).forEach(key => {
      let rep_regex = new RegExp(`{{${key}}}`, "gi");
      urlString = urlString.replace(rep_regex, valuesToReplace[key]);
    });

    return JSON.parse(urlString);
  },
  pushWidgetApis: ({ sectionId, pageInfo, apisObj }) => {
    Object.keys(apisObj).forEach(apiKey => {
      const apiObj = {
        data: true,
        api: pageInfo.wafModules[sectionId].widgetConfig.apis[apiKey],
        sectionId,
        key: apiKey
      };
      pageInfo.widgetApis.push(apiObj);
    });
  },
  "si-scorestrip": ({ winstonLogger, pageInfo, sectionId }) => {
    try {
      let fullWidgetData = pageInfo.wafModules[sectionId];

      if (fullWidgetData.required_entities && fullWidgetData.required_entities.length) {
        let allWidgetEntitiesFoundOnPage = fullWidgetData.required_entities.every(entityId => {
          if (pageInfo.content.required_entities) {
            const matchFound = pageInfo.content.required_entities.find(pageEntityInfo => {
              if (pageEntityInfo.is_required === 2) return false;
              return pageEntityInfo.entity_id === entityId;
            });
            return matchFound;
          }
          return false;
        });
        if (!allWidgetEntitiesFoundOnPage) {
          fullWidgetData.err = "Error";
          return;
        }
      }

      fullWidgetData.meta_info = fullWidgetData.meta_info || {};
      fullWidgetData.meta_info = Object.assign(fullWidgetData.meta_info, pageInfo.content.custom_meta_info.scores_filter);
      fullWidgetData.meta_info.filter = pageInfo.content.custom_meta_info.scores_filter.data;
      delete fullWidgetData.meta_info.data;

      fullWidgetData.dataToPass = {
        extraClass: fullWidgetData.meta_info.extraclass,
        widgetTitleTag: fullWidgetData.meta_info.widget_title_tag,
        filter: fullWidgetData.meta_info.filter,
        team: fullWidgetData.meta_info.team,
        tournament: fullWidgetData.meta_info.tournament,
        hasLeagueFilter: fullWidgetData.meta_info.has_filter
      };
      let valuesToReplace = {};
      commonParsers.scoreStripPreParser(fullWidgetData, {
        isServer: true,
        toBeFetchedFrom: fullWidgetData.meta_info,
        valueReplacerObj: valuesToReplace,
        selectedLang: pageInfo.selectedLanguage
      });

      fullWidgetData.widgetConfig.apis = apiReplacer.commonReplacer({
        urlObj: fullWidgetData.widgetConfig.apis,
        valuesToReplace,
        pageInfo
      });

      apiReplacer.pushWidgetApis({ sectionId, apisObj: fullWidgetData.widgetConfig.apis, pageInfo });
    } catch (e) {
      pageInfo.wafModules[sectionId].err = true;
      winstonLogger.error({ location: "apiReplacer-scoreStrip", name: e.name, message: e.message });
    }
  },
  "si-standings": ({ winstonLogger, pageInfo, sectionId }) => {
    try {
      let fullWidgetData = pageInfo.wafModules[sectionId];
      let seriesId = fullWidgetData.meta_info.standings_filter.series_id;
      let selectedSportName = fullWidgetData.meta_info.standings_filter.name.toLowerCase();
      let selectedSport = selectedSportName === "cricket" ? 1 : selectedSportName === "football" ? 2 : 3;
      let leagueCode = fullWidgetData.meta_info.standings_filter.league_code || "";
      fullWidgetData.dataToPass = {
        showWidgetTitle: fullWidgetData.meta_info.show_widget_title,
        widgetTitleTag: fullWidgetData.meta_info.widget_title_tag,
        standingsFilter: fullWidgetData.meta_info.standings_filter,
        displayTitle: fullWidgetData.display_title,
        extraClass: fullWidgetData.meta_info.extraclass,
        selectedSport,
        selectedSportName,
        leagueCode,
        seriesId
      };

      fullWidgetData.widgetConfig.apis = {
        standingsData: fullWidgetData.widgetConfig.sportApis[selectedSport]
      };

      let valuesToReplace = {
        SERIESID: seriesId,
        LEAGUECODE: leagueCode
      };

      fullWidgetData.widgetConfig.apis = apiReplacer.commonReplacer({
        urlObj: fullWidgetData.widgetConfig.apis,
        valuesToReplace,
        pageInfo
      });

      apiReplacer.pushWidgetApis({ sectionId, apisObj: fullWidgetData.widgetConfig.apis, pageInfo });
    } catch (e) {
      pageInfo.wafModules[sectionId].err = true;
      winstonLogger.error({ location: "apiReplacer-standings", name: e.name, message: e.message });
    }
  },
  "si-seriesarchives": ({ winstonLogger, pageInfo, sectionId }) => {
    try {
      let fullWidgetData = pageInfo.wafModules[sectionId];
      const currDate = new Date();
      const currYear = currDate.getFullYear();
      fullWidgetData.selectedYear = currYear;
      fullWidgetData.years = fullWidgetData.widgetConfig.years;
      fullWidgetData.dataToPass = {
        selectedYear: currYear
      };
      let valuesToReplace = {
        YEAR: currYear
      };

      fullWidgetData.widgetConfig.apis = apiReplacer.commonReplacer({
        urlObj: fullWidgetData.widgetConfig.apis,
        valuesToReplace,
        pageInfo
      });

      apiReplacer.pushWidgetApis({ sectionId, apisObj: fullWidgetData.widgetConfig.apis, pageInfo });
    } catch (e) {
      pageInfo.wafModules[sectionId].err;
      winstonLogger.error({ location: "apiReplacer-seriesListing", name: e.name, message: e.message });
    }
  },
  "si-fixtures": async ({ winstonLogger, pageInfo, sectionId, axios, route, LRUCache, signaturesToCacheArray, LRUCacheManager }) => {
    try {
      let fullWidgetData = pageInfo.wafModules[sectionId];

      fullWidgetData.dataToPass = pageInfo.content.custom_meta_info.scores_filter;

      let teamTourInfo = utils.teamTourDetection({ route, clientCode: pageInfo.configData.cmsConfig.content.clientid });

      fullWidgetData.dataToPass.teamId = teamTourInfo.teamId;
      fullWidgetData.dataToPass.teamName = teamTourInfo.teamName;

      fullWidgetData.dataToPass.tournamentId = teamTourInfo.tournamentId;
      fullWidgetData.dataToPass.tournamentName = teamTourInfo.tournamentName;

      fullWidgetData.widgetParsedData = commonParsers.fixturesPagePreParser(
        fullWidgetData.dataToPass,
        fullWidgetData.widgetConfig,
        pageInfo.configData.widgetConfig
      );

      let valuesToReplace = {
        FEEDTYPE: fullWidgetData.widgetParsedData.feedType,
        FEEDVALUE: fullWidgetData.widgetParsedData.feedValue,
        SPORT: fullWidgetData.widgetParsedData.selectedSportId,
        LANG: pageInfo.selectedLanguage,
        LEAGUECODE: fullWidgetData.widgetParsedData.selectedLeagueCode,
        SERIESID: fullWidgetData.widgetParsedData.seriesId
      };

      if (teamTourInfo.isEcnFixture) {
        fullWidgetData.widgetParsedData.preApis.multiSport = fullWidgetData.widgetConfig.apis.multiSport;

        valuesToReplace.FEEDTYPE = teamTourInfo.ecnQueryStringTourId ? "tournament" : "teamcode";
        valuesToReplace.FEEDVALUE = teamTourInfo.ecnQueryStringTourId ? teamTourInfo.ecnQueryStringTourId : teamTourInfo.ecnQueryStringTeamId;
      }

      let apisToHit = apiReplacer.commonReplacer({
        urlObj: fullWidgetData.widgetParsedData.preApis,
        valuesToReplace,
        pageInfo
      });

      let promises = [];
      let keys = [];
      let apisArray = [];
      Object.keys(apisToHit).forEach(key => {
        let api = apisToHit[key];
        keys.push(key);
        apisArray.push(api);
        let storedDataString = LRUCache.get(api);
        if (storedDataString) {
          let storedData = JSON.parse(storedDataString);
          if (storedData.validity > Date.now()) {
            promises.push(
              new Promise((resolve, reject) => {
                resolve(storedData.value);
              })
            );
          } else {
            promises.push(axios.$get(api, { headers: { "Accept-Encoding": "gzip" } }));
          }
        } else {
          promises.push(axios.$get(api, { headers: { "Accept-Encoding": "gzip" } }));
        }
      });

      let allFetchedResponses = await Promise.all(promises);

      allFetchedResponses.forEach((data, i) => {
        const toBeCached = signaturesToCacheArray.find(signature => apisArray[i].includes(signature));
        if (toBeCached) {
          LRUCacheManager(LRUCache, apisArray[i], data);
        }
        fullWidgetData.widgetParsedData.preFetchedData[keys[i]] = data;
      });

      delete fullWidgetData.widgetConfig.apis.dateList;
      delete fullWidgetData.widgetConfig.apis.teamTourList;

      if (fullWidgetData.widgetParsedData.preFetchedData && fullWidgetData.widgetParsedData.preFetchedData.dateList) {
        fullWidgetData.widgetParsedData.monthsArray = utils.monthsList(fullWidgetData.widgetParsedData.preFetchedData.dateList.dates);
        fullWidgetData.widgetParsedData.yearAndMonthObj = utils.getYearMonthObj(fullWidgetData.widgetParsedData.monthsArray);
        fullWidgetData.widgetParsedData.selectedMonthObj = utils.getClosestMonth(fullWidgetData.widgetParsedData.monthsArray);
        valuesToReplace.FEEDVALUE = fullWidgetData.widgetParsedData.selectedMonthObj.dateRange;
        if (
          fullWidgetData.widgetParsedData.yearAndMonthObj &&
          fullWidgetData.widgetParsedData.yearAndMonthObj.yearArray &&
          fullWidgetData.widgetParsedData.minMatchYear
        ) {
          fullWidgetData.widgetParsedData.yearAndMonthObj.yearArray = fullWidgetData.widgetParsedData.yearAndMonthObj.yearArray.filter(
            year => +year >= +fullWidgetData.widgetParsedData.minMatchYear
          );
        }
      }
      if (fullWidgetData.widgetParsedData.preFetchedData && fullWidgetData.widgetParsedData.preFetchedData.multiSport) {
        // fullWidgetData.widgetConfig.apis = {};
        let redirectionConfig;
        pageInfo.redirection = true;
        let redirectionUrl = "cricket/scores-fixtures/{{TEAMNAME}}-{{TEAMID}}";
        if (teamTourInfo.ecnQueryStringTourId) {
          redirectionUrl = "/cricket/series/{{TOURNAME}}-{{TOURID}}/scores-fixtures";
          if (pageInfo.content.custom_meta_info.scores_filter.extra_filter) {
            redirectionConfig = pageInfo.content.custom_meta_info.scores_filter.extra_filter.find(data => data.name.toLowerCase() === "tournaments");
          }
        } else if (teamTourInfo.ecnQueryStringTeamId) {
          redirectionUrl = "/cricket/scores-fixtures/{{TEAMNAME}}-{{TEAMID}}";
          if (pageInfo.content.custom_meta_info.scores_filter.extra_filter) {
            redirectionConfig = pageInfo.content.custom_meta_info.scores_filter.extra_filter.find(data => data.name.toLowerCase() === "teams");
            redirectionUrl = redirectionConfig ? "/" + redirectionConfig.redirect_link : redirectionUrl;
          }
        }
        redirectionUrl = redirectionConfig ? "/" + redirectionConfig.redirect_link : redirectionUrl;
        if (
          fullWidgetData.widgetParsedData.preFetchedData.multiSport.matches &&
          fullWidgetData.widgetParsedData.preFetchedData.multiSport.matches.length
        ) {
          let tourId = teamTourInfo.ecnQueryStringTourId;
          let teamId = teamTourInfo.ecnQueryStringTeamId;
          let tourName = fullWidgetData.widgetParsedData.preFetchedData.multiSport.matches[0].tour_name
            .replace(/[^a-zA-Z0-9]/g, "-")
            .replace(/--/g, "-")
            .toLowerCase();
          let teamName =
            fullWidgetData.widgetParsedData.preFetchedData.multiSport.matches[0].participants[0].id === teamId
              ? fullWidgetData.widgetParsedData.preFetchedData.multiSport.matches[0].participants[0].name
              : fullWidgetData.widgetParsedData.preFetchedData.multiSport.matches[0].participants[1].name;
          teamName = teamName
            .replace(/[^a-zA-Z0-9]/g, "-")
            .replace(/--/g, "-")
            .toLowerCase();

          redirectionUrl = redirectionUrl
            .replace("{{TEAMID}}", teamId)
            .replace("{{TEAMNAME}}", teamName)
            .replace("{{TOURID}}", tourId)
            .replace("{{TOURNAME}}", tourName);
        }
        pageInfo.fixturesUrl = redirectionUrl.includes("{{") ? route.path : redirectionUrl;
        // pageInfo.fixturesUrl = redirectionUrl.includes("{{") ? "" : redirectionUrl;
      }

      fullWidgetData.widgetConfig.apis = apiReplacer.commonReplacer({
        urlObj: fullWidgetData.widgetConfig.apis,
        valuesToReplace,
        pageInfo
      });

      apiReplacer.pushWidgetApis({ sectionId, apisObj: fullWidgetData.widgetConfig.apis, pageInfo });
    } catch (e) {
      pageInfo.wafModules[sectionId].err = true;
      winstonLogger.error({ location: "apiReplacer-fixtures", name: e.name, message: e.message });
    }
  },
  "si-statslisting": ({ winstonLogger, pageInfo, sectionId }) => {
    try {
      let fullWidgetData = pageInfo.wafModules[sectionId];
      let valuesToReplace = {
        STATSID: 0,
        SERIESID: fullWidgetData.meta_info.stats_filter.series_id
        // SERIESID: 3130
      };
      fullWidgetData.widgetConfig.apis = apiReplacer.commonReplacer({
        urlObj: fullWidgetData.widgetConfig.apis,
        valuesToReplace,
        pageInfo
      });
      apiReplacer.pushWidgetApis({ sectionId, apisObj: fullWidgetData.widgetConfig.apis, pageInfo });
    } catch (e) {
      pageInfo.wafModules[sectionId].err = true;
      winstonLogger.error({ location: "apiReplacer-statslisting", name: e.name, message: e.message });
    }
  },
  "si-ads": ({ winstonLogger, pageInfo, sectionId }) => {
    try {
      let fullWidgetData = pageInfo.wafModules[sectionId];
      let { isWebView, isMobile } = pageInfo;
      let pollId = pageInfo.content.custom_meta_info.poll_id;
      const adComponent = utils.getAdComponent([fullWidgetData], { isMobile, isWebView });
      if (adComponent && adComponent.ad_code) {
        if (adComponent.ad_code.includes('id="man_of_the_match"') && pollId) {
          let valuesToReplace = {
            POLLID: pollId,
            USER_GUID: "aa"
          };
          fullWidgetData.widgetConfig.apis = apiReplacer.commonReplacer({
            urlObj: fullWidgetData.widgetConfig.apis,
            valuesToReplace,
            pageInfo
          });
          apiReplacer.pushWidgetApis({ sectionId, apisObj: fullWidgetData.widgetConfig.apis, pageInfo });
        }
      }
    } catch (e) {
      pageInfo.wafModules[sectionId].err = true;
      winstonLogger.error({ location: "apiReplacer-siads", name: e.name, message: e.message });
    }
  },
  "si-tracker": ({ winstonLogger, pageInfo, sectionId }) => {
    try {
      let fullWidgetData = pageInfo.wafModules[sectionId];
      fullWidgetData.seriesId = fullWidgetData.meta_info.stats_filter.series_id;
      let valuesToReplace = {
        SERIESID: fullWidgetData.seriesId
      };

      fullWidgetData.widgetConfig.apis = apiReplacer.commonReplacer({
        urlObj: fullWidgetData.widgetConfig.apis,
        valuesToReplace,
        pageInfo
      });

      apiReplacer.pushWidgetApis({ sectionId, apisObj: fullWidgetData.widgetConfig.apis, pageInfo });
    } catch (e) {
      pageInfo.wafModules[sectionId].err = true;
      winstonLogger.error({ location: "apiReplacer-tracker", name: e.name, message: e.message });
    }
  },
  "si-cricketscorecard": async ({ winstonLogger, pageInfo, sectionId, route, axios }) => {
    try {
      let fullWidgetData = pageInfo.wafModules[sectionId];

      const gameCode = route.path.split("-").pop();
      const defaultTab = route.path.split("/")[3] ? route.path.split("/")[3] : "scorecard";

      fullWidgetData.widgetConfig.defaultTab = defaultTab;

      if (defaultTab.toLowerCase() === "commentary") {
        let matchData = false;
        let commentaryData = false;
        try {
          let matchDataApi = fullWidgetData.widgetConfig.apis.gameData.replace("{{GAMECODE}}", gameCode);
          matchData = await axios.$get(matchDataApi, { headers: { "Accept-Encoding": "gzip" } });
          let session = 1;
          if (matchData.Innings && matchData.Innings.length) {
            session = matchData.Innings.length;
          }
          let matchId = gameCode.replace(/[^0-9]/g, "");
          if (matchId.length > 8) matchId = matchId.substring("8", matchId.length);
          let commentaryDataApi = fullWidgetData.widgetConfig.otherApis.commentary.replace("{{MATCHID}}", matchId).replace("{{SESSION}}", session);
          commentaryData = await axios.$get(commentaryDataApi, { headers: { "Accept-Encoding": "gzip" } });
        } catch (e) {
          winstonLogger.error({ location: "apiReplacer-cricketscorecard-api", name: e.name, message: e.message });
        } finally {
          fullWidgetData.matchData = matchData;
          fullWidgetData.commentaryData = commentaryData;
          delete fullWidgetData.widgetConfig.apis.gameData;
          if (!commentaryData) {
            pageInfo.redirection = true;
            pageInfo.scorecardUrl = route.path.replace("/commentary", "/scorecard");
          }
        }
      }

      fullWidgetData.widgetConfig.gameCode = gameCode;
      let valuesToReplace = {
        GAMECODE: gameCode
      };

      fullWidgetData.widgetConfig.apis = apiReplacer.commonReplacer({
        urlObj: fullWidgetData.widgetConfig.apis,
        valuesToReplace,
        pageInfo
      });
      apiReplacer.pushWidgetApis({ sectionId, apisObj: fullWidgetData.widgetConfig.apis, pageInfo });
    } catch (e) {
      pageInfo.wafModules[sectionId].err = true;
      winstonLogger.error({ location: "apiReplacer-cricketscorecard", name: e.name, message: e.message });
    }
  },
  "si-footballscorecard": ({ winstonLogger, pageInfo, sectionId, route }) => {
    try {
      let fullWidgetData = pageInfo.wafModules[sectionId];
      const gameCode = route.path.split("-").pop();
      const defaultTab = route.path.split("/")[4] ? route.path.split("/")[4] : "scorecard";
      const leagueName = route.path.split("/")[2];
      let leagueCode = "epl";
      Object.keys(pageInfo.configData.widgetConfig.footballScoreCardMapper).forEach(leagueCodeKey => {
        if (pageInfo.configData.widgetConfig.footballScoreCardMapper[leagueCodeKey] === leagueName) {
          leagueCode = leagueCodeKey;
        }
      });
      fullWidgetData.widgetConfig.defaultTab = defaultTab;

      fullWidgetData.widgetConfig.gameCode = gameCode;
      fullWidgetData.widgetConfig.leagueCode = leagueCode;
      let valuesToReplace = {
        GAMECODE: gameCode,
        LEAGUECODE: leagueCode
      };

      fullWidgetData.widgetConfig.apis = apiReplacer.commonReplacer({
        urlObj: fullWidgetData.widgetConfig.apis,
        valuesToReplace,
        pageInfo
      });

      apiReplacer.pushWidgetApis({ sectionId, apisObj: fullWidgetData.widgetConfig.apis, pageInfo });
    } catch (e) {
      pageInfo.wafModules[sectionId].err = true;
      winstonLogger.error({ location: "apiReplacer-cricketscorecard", name: e.name, message: e.message });
    }
  },
  "si-kabaddiscorecard": ({ winstonLogger, pageInfo, sectionId, route }) => {
    try {
      let fullWidgetData = pageInfo.wafModules[sectionId];
      const gameCode = route.path.split("-").pop();
      const defaultTab = route.path.split("/")[3] ? route.path.split("/")[3] : "scorecard";
      //const leageCode = route.path.split("-").pop();
      fullWidgetData.widgetConfig.defaultTab = defaultTab;

      fullWidgetData.widgetConfig.gameCode = gameCode;

      let valuesToReplace = {
        GAMECODE: gameCode
      };

      fullWidgetData.widgetConfig.apis = apiReplacer.commonReplacer({
        urlObj: fullWidgetData.widgetConfig.apis,
        valuesToReplace,
        pageInfo
      });
      apiReplacer.pushWidgetApis({ sectionId, apisObj: fullWidgetData.widgetConfig.apis, pageInfo });
    } catch (e) {
      pageInfo.wafModules[sectionId].err = true;
      winstonLogger.error({ location: "apiReplacer-footballscorecard", name: e.name, message: e.message });
    }
  },
  "si-statsdetail": ({ winstonLogger, pageInfo, sectionId, route }) => {
    try {
      let fullWidgetData = pageInfo.wafModules[sectionId];
      // fullWidgetData.meta_info.extraData = JSON.parse(fullWidgetData.meta_info.extraData);
      // fullWidgetData.meta_info.stats_filter.series_id = 3130;
      let seriesId = fullWidgetData.meta_info.stats_filter.series_id;

      fullWidgetData.selectedStatId = "2";
      let valuesToReplace = {
        SERIESID: seriesId,
        STATSID: fullWidgetData.selectedStatId
      };

      fullWidgetData.widgetConfig.apis = apiReplacer.commonReplacer({
        urlObj: fullWidgetData.widgetConfig.apis,
        valuesToReplace,
        pageInfo
      });
      apiReplacer.pushWidgetApis({ sectionId, apisObj: fullWidgetData.widgetConfig.apis, pageInfo });
    } catch (e) {
      pageInfo.wafModules[sectionId].err = true;
      winstonLogger.error({ location: "apiReplacer-statsdetail", name: e.name, message: e.message });
    }
  }
};

module.exports = apiReplacer;
