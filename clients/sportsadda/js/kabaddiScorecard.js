import render from "./../../../components/si-kabaddiscorecard/widget-layout-01.vue";
const { getTeamCustomName, getTourCustomName } = require("./../../../sdk/WidgetLibrary/utils");
const utils = { getTeamCustomName, getTourCustomName };
const { kabaddiScorecardDataParser } = require("./../../../sdk/WidgetLibrary/clientServerCommon.js");

const SIClass = class {
  constructor(config, VueLib, widgetConfig, commonFunctions) {
    this.config = config;
    this.Vue = VueLib;
    this.widgetConfig = widgetConfig;
    this.selectedLang = widgetConfig.container.getAttribute("selectedLanguage");
    this.commonFunctions = commonFunctions;
    this.league = widgetConfig.container.getAttribute("selectedLeague") || "0";
    this.gameCode = widgetConfig.container.getAttribute("data-gameCode") || "1819";
    this.defaulttab = widgetConfig.container.getAttribute("data-defaulttab") || "scorecard";
    this.liveUpdateFiles = {};

    this.widgetId = widgetConfig.container.getAttribute("widget-id");
    this.titleData = {
      tag: this.titleElem ? this.titleElem.tagName.toLowerCase() : "",
      displayTitle: this.titleElem ? this.titleElem.innerText : ""
    };
  }
  init() {
    this.hydration();
  }
  hydration() {
    this.getWidgetData()
      .then(resp => {
        this.mountMarkup(resp.gameData);
      })
      .catch(function (err) {
        console.log("Error while hydration", err);
      });
  }

  getWidgetData() {
    let promiseArray = [];
    let responseData = {};

    for (let keys in this.widgetConfig.apis) {
      let requestUrl = this.widgetConfig.apis[keys].replace("{{LANG}}", this.selectedLang).replace("{{GAMECODE}}", this.gameCode);

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
    //let customNames = clientCache.customNames;
    let staticData = {};

    let instanceParams = {
      //clientConfig: this.config,
      //clientCache,
      staticData,
      gameData: data,
      selectedInn: 0,
      selectedTeam: data.teams.team[0].id,
      squads: [],
      commentaryData: [],
      commAPILoading: true,
      loadmore: false,
      gamecode: this.gamecode,
      defaulttab: this.defaulttab,
      //widgetNode: this.config.widgets.matchCenter.matchCenter,
      selectedLang: this.selectedLang
      //templateMarkup: markupData
    };

    let vueInstance = new Vue(render);

    // Accordion
    let togglePlayer = {};
    for (let i = 0; i < instanceParams.gameData.teams.team.length; i++) {
      const team = instanceParams.gameData.teams.team[i];
      for (let j = 0; j < team.squad.length; j++) {
        const squad = team.squad[j];
        togglePlayer[squad.id] = 0;
      }
    }

    instanceParams.togglePlayer = togglePlayer;

    // Setting Tab constant
    instanceParams.scoreTab = "scorecard";
    instanceParams.statTab = "match-stats";
    instanceParams.pbpTab = "play-by-play";

    vueInstance.widgetData = instanceParams;
    vueInstance.imagePaths = this.config.imagePaths;

    this.widgetConfig.container.innerHTML = "";

    vueInstance.$mount(this.widgetConfig.container, true);

    window.vueInstance = vueInstance;

    vueInstance.tabSelection = (tab, filter, inningNo) => {
      let _newUrl = window.location.href;
      vueInstance.widgetData.defaulttab = tab;

      switch (tab) {
        case vueInstance.widgetData.pbpTab:
          this.processPBP(vueInstance);
          _newUrl = _newUrl.replace(vueInstance.widgetData.scoreTab, tab).replace(vueInstance.widgetData.statTab, tab);
          break;
        case vueInstance.widgetData.scoreTab:
          if (filter == "innings") vueInstance.widgetData.selectedInn = inningNo;
          if (filter == "teams") vueInstance.widgetData.selectedTeam = inningNo;
          //this.updateScoreCard(vueInstance,filter,inningNo);
          _newUrl = _newUrl
            .replace(vueInstance.widgetData.pbpTab, vueInstance.widgetData.scoreTab)
            .replace(vueInstance.widgetData.statTab, vueInstance.widgetData.scoreTab);
          break;
        default:
          _newUrl = _newUrl
            .replace(vueInstance.widgetData.scoreTab, vueInstance.widgetData.statTab)
            .replace(vueInstance.widgetData.pbpTab, vueInstance.widgetData.statTab);
          break;
      }

      history.pushState({ page: tab }, tab, _newUrl);
    };

    vueInstance.togglePlayer = (squad, team, index) => {
      if (squad.points.raid_points.total) {
        for (let key in vueInstance.widgetData.togglePlayer) {
          if (squad.id == key) {
            if (vueInstance.widgetData.togglePlayer[key] === 0) {
              vueInstance.widgetData.togglePlayer[key] = 1;
              console.log(squad.id, team, index)
              vueInstance.raidSequence(squad.id, team, index);
            } else {
              vueInstance.widgetData.togglePlayer[key] = 0
            }
          } else vueInstance.widgetData.togglePlayer[key] = 0;
        }
      }
    };

    vueInstance.raidSequence = (player, team, index) => {
      let events = [];
      if (vueInstance.widgetData.gameData.events && vueInstance.widgetData.gameData.events.event) {
        vueInstance.widgetData.gameData.events.event.forEach(function (event) {
          if (event.raider_id === player) {
            events.push(event);
          }
        });
      }
      vueInstance.widgetData.gameData.teams.team[team].squad[index].events = events;
    }

    vueInstance.tabSelection(vueInstance.widgetData.defaulttab);

    // let reqParams = { vueInstance, self: this };
    // this.commonFunctions.getMatchesData(reqParams, this.updateData);
  }
  /* parseMatchesData(matchesArray, marketDataArray = [], customNames, sort = true) {
    return scoreStripDataParser({ matches: matchesArray, marketDataArray, utils, customNames });
  } */

  processPBP(vueInstance) {
    var matchData = vueInstance.widgetData.gameData;
    var minutesArr = [];
    //console.log(matchData)
    var pbp = matchData && matchData.events && matchData.events.event;
    if (!(pbp && Array.isArray(pbp))) {
      pbpCb({ pbp: [] });
      return;
    }
    var homeTeam, awayTeam, teamsObj;
    if (matchData.teams.team[0].id === matchData.teams.home_team_id) {
      homeTeam = matchData.teams.team[0];
      awayTeam = matchData.teams.team[1];
    } else {
      homeTeam = matchData.teams.team[1];
      awayTeam = matchData.teams.team[0];
    }
    teamsObj = {};
    teamsObj[homeTeam.id] = homeTeam;
    teamsObj[awayTeam.id] = awayTeam;
    var players = homeTeam.squad.concat(awayTeam.squad);
    var playersObj = players.reduce(function (obj, cur) {
      obj[cur.id] = cur;
      return obj;
    }, {});
    var isResultAdded = false,
      isTossAdded = false;
    pbp.forEach(function (p, idx) {
      if (!p.score && pbp[idx - 1]) {
        if (pbp[idx - 1] && pbp[idx - 1].score) {
          p.score = pbp[idx - 1].score;
        } else {
          p.score = [0, 0];
        }
      }
      if (p.event === "toss") {
        isTossAdded = true;
      }
      if (p.event === "result") {
        isResultAdded = true;
      }

      var minutes = p.clock;
      if (minutes) {
        minutesArr = minutes.split(":");
        minutes = parseInt(minutesArr[0]) || 0;
        if (parseInt(minutesArr[1])) {
          minutes++;
        }
        minutes += "'";
      } else {
        minutes = "!";
      }
      p.minutes = minutes;
      if ([5, 8, 9, 10, 11].indexOf(p.event_id) > -1) {
        p.isSpecialEvent = true;
        p.event = p.event.toUpperCase();
      }

      var team, player, primaryTeam, secondaryTeam, primaryPlayer, secondaryPlayer;
      if (p.raiding_team_id || p.team_id) {
        team = teamsObj[p.raiding_team_id] || teamsObj[p.team_id];
        if (team) {
          primaryTeam = {
            id: team.id,
            name: team.name,
            short_name: team.short_name
          };
        }
      }
      if (p.defending_team_id) {
        team = teamsObj[p.defending_team_id];
        if (team) {
          secondaryTeam = {
            id: team.id,
            name: team.name,
            short_name: team.short_name
          };
        }
      }

      if (p.raider_id || p.substituted_by || (p.event_id !== 5 && p.player_id)) {
        player = playersObj[p.raider_id] || playersObj[p.substituted_by] || playersObj[p.player_id];
        primaryPlayer = {
          id: player.id,
          name: player.name,
          short_name: player.short_name
        };
      }
      if (p.defender_id || p.event_id === 5) {
        player = playersObj[p.defender_id] || playersObj[p.player_id];
        secondaryPlayer = {
          id: player.id,
          name: player.name,
          short_name: player.short_name
        };
      }
      p.primaryTeam = primaryTeam;
      p.secondaryTeam = secondaryTeam;
      p.primaryPlayer = primaryPlayer;
      p.secondaryPlayer = secondaryPlayer;

      //console.log(p.event_id)
      //console.log(p)
    });

    if (matchData.match_detail.toss && matchData.match_detail.toss.winner) {
      var teamName;

      if (matchData.teams.team[0].id === matchData.match_detail.toss.winner.toString()) {
        teamName = matchData.teams.team[0].name;
      } else {
        teamName = matchData.teams.team[1].name;
      }
      var toss = teamName + " wins the toss & ";
      var side = matchData.match_detail.toss.selection;
      toss += side;
      if (!isTossAdded) {
        pbp.unshift({ event: "toss", event_id: "0", event_text: toss, score: [0, 0], minutes: "!" });
      }
    }
    if (matchData.match_detail.result && matchData.match_detail.result.value) {
      if (!isResultAdded) {
        pbp.push({
          event: "result",
          event_id: "0",
          event_text: matchData.match_detail.result.value,
          score: [homeTeam.score, awayTeam.score],
          minutes: "!"
        });
      }
    }
    var clonePbp = JSON.parse(JSON.stringify(pbp));
    clonePbp.reverse();
    vueInstance.widgetData.commentaryData = clonePbp;

  }
};

window.SIWidget.SIClass = window.SIWidget.SIClass || {};
window.SIWidget.SIClass["kabaddiScorecard"] = SIClass;
