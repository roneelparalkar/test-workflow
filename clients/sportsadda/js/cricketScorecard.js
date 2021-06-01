import render from "./../../../components/si-cricketscorecard/widget-layout-01.vue";
const { getTeamCustomName, getTourCustomName } = require("./../../../sdk/WidgetLibrary/utils");
const utils = { getTeamCustomName, getTourCustomName };
const { cricketScorecardDataParser } = require("./../../../sdk/WidgetLibrary/clientServerCommon.js");

let commPageNo = 0,
  apiBasePath = `https://${window.location.host}/`;
//apiBasePath = "https://demo.sportz.io/sifeeds/repo/";
//apiBasePath = "https://demo.sportz.io/gateway/";
//apiBasePath = "https://demo.sportz.io/";

const SIClass = class {
  constructor(config, VueLib, widgetConfig, commonFunctions) {
    this.config = config;
    this.Vue = VueLib;
    this.widgetConfig = widgetConfig;
    this.selectedLang = widgetConfig.container.getAttribute("selectedLanguage");
    this.commonFunctions = commonFunctions;
    this.serverData = widgetConfig.container.getAttribute("server-data");
    this.titleElem = widgetConfig.container.querySelector(".title");
    this.gameCode = widgetConfig.container.getAttribute("data-gameCode") || "afzm03102021200550";
    this.defaulttab = widgetConfig.container.getAttribute("data-defaulttab") || "scorecard";
    this.isMobile = widgetConfig.container.getAttribute("is-mobile");
    this.oddsLink = widgetConfig.container.getAttribute("odds-link");
    this.partnerLogo = widgetConfig.container.getAttribute("partner-logo");
    this.liveUpdateFiles = {};
    this.graphtype = "graphs";
    this.titleData = {
      tag: this.titleElem ? this.titleElem.tagName.toLowerCase() : "",
      displayTitle: this.titleElem ? this.titleElem.innerText : ""
    };
  }
  init() {
    this.hydration();
  }
  hydration() {
    //this.preApiParser();
    this.getWidgetData()
      .then(resp => {
        this.parseData(resp);
        /*var data = resp.gameData
		if(data && data.Matchdetail.Result && data.Matchdetail.Result!=''){
			this.parseData(resp);
		}else{
			this.getMarketData(data);
			this.parseData(resp);
		}*/
      })
      .catch(function(err) {
        console.log("Error while hydration", err);
      });
  }
  parseData(resonse, type, vueInstance) {
    let customNames = window.SIWidget.customNames;
    let isServer = false;
    let isMobile = false;
    let _gameData = cricketScorecardDataParser({ matcheData: resonse.gameData, utils, customNames, isServer, isMobile });
    if (type && type == "onUpdate" && vueInstance) {
      vueInstance.widgetData.gameData = _gameData;
      if (vueInstance.widgetData.selectedTeam && vueInstance.widgetData.selectedTeam > 0) {
        this.updateScoreCard(vueInstance, "squads", vueInstance.widgetData.selectedTeam);
      }
    } else this.mountMarkup(_gameData);
  }
  getWidgetData() {
    let promiseArray = [];
    let responseData = {};

    for (let keys in this.widgetConfig.apis) {
      let requestUrl = this.widgetConfig.apis[keys].replace("{{LANG}}", this.selectedLang).replace("{{GAMECODE}}", this.gameCode);

      this.liveUpdateFiles[keys] = requestUrl;

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
  updateCommentary(vueInstance, commAssets, commType) {
    for (var i = 0; i < commAssets.length; i++) {
      var a = commAssets[i],
        asset = "";
      (a.results = []), (a.msgOwner = "");
      var aData = a.custom_metadata && a.custom_metadata.asset;
      if (a.source_id == 10 && a.custom_metadata.metadata) {
        aData = a.custom_metadata.metadata;
      }
      if (aData && aData.length) {
        try {
          aData = aData.replace(/\r?\n|\r/g, " ");
          aData = aData.replace(/\t/g, "    ");
          aData = JSON.parse(aData);
          commAssets[i]["assets"] = aData;
        } catch (e) {
          console.warn(e.stack);
        }
      }

      var _activeTab = vueInstance.defaulttab || "commentary";
      var _activeCommTab = vueInstance.defaultCommTab || "all";
      var commfound = false;

      if (vueInstance.widgetData.commentaryData.length) {
        for (var c = 0; c < vueInstance.widgetData.commentaryData.length; c++) {
          if (a.id == vueInstance.widgetData.commentaryData[c].id) {
            if (a.source_id != 11 && a.source_id != 4 && a.source_id != 3 && a.source_id != 5 && a.source_id != 10) {
              vueInstance.widgetData.commentaryData[c] = a;
            }
            commfound = true;
            break;
          }
        }
      }

      if (!commfound && (commType == "loadmore" || commType == "onload")) {
        vueInstance.widgetData.commentaryData.push(a);
      } else if (
        !commfound &&
        vueInstance.widgetData.commentaryData &&
        vueInstance.widgetData.commentaryData.length &&
        vueInstance.widgetData.commentaryData[0].id < a.id &&
        a.source_id != 11
      ) {
        if (_activeTab == "wall-stream" && (a.source_id == 1 || a.source_id == 6 || a.source_id == 9 || a.source_id == 12)) {
          vueInstance.widgetData.commentaryData.unshift(a);
        } else if (_activeTab == "summary" || (_activeTab == "commentary" && _activeCommTab == "all")) {
          vueInstance.widgetData.commentaryData.unshift(a);
        }
      } else if (!commfound) {
        if (a.source_id == 11 && vueInstance.activePoll) {
          var pollFound = false;
          for (var p = 0; p < vueInstance.activePoll.length; p++) {
            if (vueInstance.activePoll[p].id == a.id) pollFound = true;
          }
          if (!pollFound) {
            vueInstance.activePoll.unshift(a);
            vueInstance.checkUnAnswerPoll();
          }
        } else if (a.source_id != 2 && _activeCommTab == "all") {
          vueInstance.widgetData.commentaryData.unshift(a);
        }
      }

      // updating last six ball

      if (a && a.assets && a.assets.Isball) {
        aData.id = a.id;
        if (!vueInstance.widgetData.staticData.lastSixBalls) return;

        if (!vueInstance.widgetData.staticData.lastSixBalls.length) {
          vueInstance.widgetData.staticData.lastSixBalls.unshift(aData);
        }
        var lastSixBallFound = false;
        for (var l = 0; l < vueInstance.widgetData.staticData.lastSixBalls.length; l++) {
          if (vueInstance.widgetData.staticData.lastSixBalls[l].id == a.id) {
            vueInstance.widgetData.staticData.lastSixBalls[l] = aData;
            lastSixBallFound = true;
          }
        }
        if (!lastSixBallFound) {
          if (a.id > vueInstance.widgetData.staticData.lastSixBalls[vueInstance.widgetData.staticData.lastSixBalls.length - 1].id) {
            vueInstance.widgetData.staticData.lastSixBalls.push(aData);
          }
          if (vueInstance.widgetData.staticData.lastSixBalls.length > 6) vueInstance.widgetData.staticData.lastSixBalls.shift();
        }
      }
      ///////////////////////////
    }
    setTimeout(() => {
      adModule();
    }, 400);
    //SI_CRI.loadTime = new Date();
    //isLoadMoreInProgress=false;
    //this.renderSocial();
  }

  getCommentaryData(gamecode, tab, filter, inningNo) {
    let promiseArray = [];
    let responseData = {};

    var match_id = gamecode.replace(/[^0-9]/g, "");
    if (match_id.length > 8) match_id = match_id.substring("8", match_id.length);
    let requestUrl = "",
      filterId = "",
      session = "",
      assetId = "1,3,4,5,6,9,10,12";

    let client_id = "rPhqZfQFgusvF4M1mwvuEA==";
    //let client_id="YNVdD8t30rXqeXRNnrC7SQ==";

    //session=inningNo?inningNo:0
    session = inningNo ? inningNo : 1;

    if (filter != "poll") commPageNo = commPageNo + 1;

    if (tab == "poll") {
      assetId = "11";
      requestUrl =
        apiBasePath +
        "functions/wallstream/?sport_id=1&client_id=" +
        client_id +
        "&match_id=" +
        match_id +
        "&page_no=" +
        commPageNo +
        "&asset_type_id=" +
        assetId;

      this.liveUpdateFiles.polls =
        apiBasePath + "functions/wallstream/?sport_id=1&client_id=" + client_id + "&match_id=" + match_id + "&page_no=0&asset_type_id=" + assetId;
    } else {
      if (filter == "wkts") {
        filterId = "3";
        commPageNo = 1;
        session = inningNo ? inningNo : 1;
      }
      requestUrl =
        apiBasePath +
        "functions/wallstream/?sport_id=1&client_id=" +
        client_id +
        "&match_id=" +
        match_id +
        "&page_size=15&page_no=" +
        commPageNo +
        "&session=" +
        session +
        "&filter_id=" +
        filterId;

      this.liveUpdateFiles.commentary =
        apiBasePath +
        "functions/wallstream/?sport_id=1&client_id=" +
        client_id +
        "&match_id=" +
        match_id +
        "&page_size=15&page_no=1&session=" +
        session +
        "&filter_id=" +
        filterId;
    }

    let promiseData = this.commonFunctions
      .apiCall(requestUrl, { isJSON: true })
      .then(response => {
        return (responseData["commentary"] = response);
      })
      .catch(err => {
        console.log("CASSSE file not available");
        console.log(err);
        //if(this.vueInstance)this.vueInstance.commAPILoading=true;
      });
    promiseArray.push(promiseData);

    return new Promise((resolve, reject) => {
      Promise.all(promiseArray)
        .then(data => {
          return resolve(responseData);
        })
        .catch(err => {
          console.log("CASSSE file2 not available");
          console.log(err);
          //if(this.vueInstance)this.vueInstance.commAPILoading=true;
        });
    });
  }

  loadCommentary(vueInstance, tab, filter, inningNo) {
    var data = vueInstance.widgetData.gameData;

    if (data.Innings && data.Innings.length) {
      if (inningNo >= 0) vueInstance.selectedInn = inningNo;
      else vueInstance.selectedInn = data.Innings.length - 1;

      //handling for old super over matches
      if (data.oldSuperOver && vueInstance.selectedInn > 2) {
        inningNo = 1;
        vueInstance.selectedInn = 1;
      }
    }

    if (data.Innings && data.Innings.length && data.Innings[vueInstance.selectedInn] && data.Innings[vueInstance.selectedInn].isso) {
      inningNo = vueInstance.selectedInn + 1 + 2; //handling inning number for comm
    } else inningNo = vueInstance.selectedInn + 1;

    if (filter != "loadmore") commPageNo = 0;
    this.latestSession = inningNo;
    var gamecode = data.Matchdetail.Match.Id;
    var _date = data.Matchdetail.Match.Date;
    /*if(_date && _date.indexOf('/')!=-1){
			var _d=_date.split('/')
			if(_d[0].length==1)_d[0]='0'+_d[0];
			if(_d[1].length==1)_d[1]='0'+_d[1];
			var _d1=''+_d[2]+_d[0]+_d[1]
			if(parseInt(_d1)>20201011){
				inningNo=0				
			}			
		}*/

    this.getCommentaryData(gamecode, tab, filter, inningNo)
      .then(resp => {
        vueInstance.widgetData.commAPILoading = false;
        if (filter != "loadmore") vueInstance.widgetData.commentaryData = [];
        vueInstance.ballinplay = [];
        if (resp.commentary.assets && resp.commentary.assets.length >= 15) vueInstance.widgetData.loadmore = true;
        this.updateCommentary(vueInstance, resp.commentary.assets, "onload");
      })
      .catch(function(err) {
        console.log("CASSSE file1 not available", err);
        if (this.vueInstance) this.vueInstance.widgetData.commAPILoading = false;
        if (vueInstance) vueInstance.widgetData.commAPILoading = false;
      });
  }
  getWinPredictorData(vueInstance, mdt) {
    if (mdt && mdt.Match && mdt.Match.Coverage_level_id && (+mdt.Match.Coverage_level_id <= 6 || mdt.Match.Type == "Test")) {
      return;
    }

    let promiseArray = [],
      responseData = {},
      requestUrl = "";
    //var gamecode = this.gamecode;
    var gamecode = mdt.Match.Code;
    requestUrl = apiBasePath + "cricket/live/json/" + gamecode + "_win_predictor.json";
    this.liveUpdateFiles["winpredictor"] = requestUrl;

    let promiseData = this.commonFunctions
      .apiCall(requestUrl, { isJSON: true })
      .then(response => {
        if (response && response.predictor) {
          for (var i = 0; i < response.predictor.length; i++) {
            response.predictor[i].team_name = this.getCustomeTeamName(response.predictor[i].team_id, false, response.predictor[i].team_name);
            response.predictor[i].team_short_name = this.getCustomeTeamName(
              response.predictor[i].team_id,
              true,
              response.predictor[i].team_short_name
            );
          }
          vueInstance.widgetData.staticData.predictor = response.predictor;
        }
      })
      .catch(err => {
        console.log(err);
      });
    promiseArray.push(promiseData);
    return new Promise((resolve, reject) => {
      Promise.all(promiseArray).then(data => {
        return resolve(responseData);
      });
    });
  }

  getPollsData(vueInstance) {
    var data = vueInstance.widgetData.gameData;
    var mdet = data.Matchdetail;
    var gamecode = data.Matchdetail.Match.Id;
    if (mdet.Match && mdet.Match.Coverage_level_id && (+mdet.Match.Coverage_level_id < 7 || +mdet.Match.Coverage_level_Id < 7)) {
      return;
    }

    this.getCommentaryData(gamecode, "poll", "poll", 1)
      .then(resp => {
        var commAssets = resp.commentary.assets;
        var ans = [],
          notAns = [];
        vueInstance.widgetData.activePoll = [];
        if (!commAssets) return;
        for (var i = 0; i < commAssets.length; i++) {
          var a = commAssets[i],
            asset = "";
          (a.results = []), (a.msgOwner = "");
          var aData = a.custom_metadata && a.custom_metadata.asset;

          if (aData && aData.length) {
            try {
              aData = aData.replace(/\r?\n|\r/g, " ");
              aData = aData.replace(/\t/g, "    ");
              aData = JSON.parse(aData);
              commAssets[i]["assets"] = aData;
            } catch (e) {
              console.warn(e.stack);
            }
          }

          vueInstance.widgetData.activePoll.push(a);
          var assetId = a.id;
          var usersAns = localStorage.getItem(assetId);
          if (usersAns) {
            ans.push(vueInstance.widgetData.activePoll[i]);
            vueInstance.getFanshoutData(a, a.id, a.assets.options, a.is_active);
          } else {
            notAns.push(vueInstance.widgetData.activePoll[i]);
          }
        }
        vueInstance.widgetData.activePoll = notAns.concat(ans);
        //vueInstance.checkUnAnswerPoll();
      })
      .catch(function(err) {
        console.log("poll comm", err);
      });
  }
  updateScoreCard(vueInstance, filter, inningNo) {
    var data = vueInstance.widgetData.gameData;
    if (filter == "squads") {
      vueInstance.widgetData.selectedTeam = inningNo;
      vueInstance.widgetData.selectedInn = -1;
      vueInstance.squadsPlayer = data.Teams[vueInstance.widgetData.selectedTeam];
    } else {
      if (data.Innings && data.Innings.length) {
        vueInstance.widgetData.selectedTeam = -1;
        if (inningNo >= 0) vueInstance.widgetData.selectedInn = inningNo;
        else vueInstance.widgetData.selectedInn = data.Innings.length - 1;
      } else {
        var defaultTeam = data.Matchdetail.Team_Home;
        for (var t in data.Teams) {
          if (t != defaultTeam) {
            defaultTeam = t;
          }
          break;
        }
        vueInstance.widgetData.selectedTeam = inningNo ? inningNo : defaultTeam;
        vueInstance.widgetData.selectedInn = -1;
        vueInstance.squadsPlayer = data.Teams[vueInstance.widgetData.selectedTeam];
      }
    }
    // squads player sorting

    var sortedPlayers = [];
    if (vueInstance.squadsPlayer && vueInstance.squadsPlayer.Players) {
      for (var k in vueInstance.squadsPlayer.Players) {
        if (vueInstance.squadsPlayer.Players.hasOwnProperty(k)) {
          sortedPlayers.push(vueInstance.squadsPlayer.Players[k]);
        }
      }
      if (data.Innings && data.Innings.length) {
        sortedPlayers.sort(function(a, b) {
          var x = parseInt(a.Position);
          var y = parseInt(b.Position);
          return x > y ? 1 : x < y ? -1 : 0;
        });
      } else {
        sortedPlayers.sort(function(a, b) {
          var x = parseInt(a.Matches);
          var y = parseInt(b.Matches);
          return x > y ? -1 : x < y ? 1 : 0;
        });
      }
      vueInstance.widgetData.gameData.squadsPlayer = sortedPlayers;
    }
  }
  drawManhattan(vueInstance, manhattanData) {
    var overs = [],
      initialSlide = 0;
    var maxrun = manhattanData ? manhattanData[0].maxrun : 0;
    if (manhattanData.length == 2) {
      if (parseInt(maxrun) < parseInt(manhattanData[1].maxrun)) {
        maxrun = manhattanData[1].maxrun;
      }
    }
    // y-axis
    var totalDisplayRun = 7;
    var scale = Math.ceil(parseInt(maxrun) / totalDisplayRun);

    var yAxis = [];
    for (var k = totalDisplayRun; k >= 1; k--) {
      yAxis.push(k * scale);
    }
    for (var k = 0; k < manhattanData.length; k++) {
      var overbyover = manhattanData[k].Overbyover;
      initialSlide = overbyover.length;
      for (var i = 0; i < overbyover.length; i++) {
        var overObj = overbyover[i];
        overObj.percent = (parseInt(overbyover[i].Runs) / parseInt(yAxis[0])) * 100 + "%";

        if (vueInstance.widgetData.gameData.Innings[k].Battingteam == vueInstance.widgetData.gameData.Matchdetail.Team_Home) {
          overObj.color = "#103c8c";
        } else {
          overObj.color = "#ff5d2b";
        }
        overObj.totalWicket = [];
        for (var w in overbyover[i].Batsmen) {
          if (overbyover[i].Batsmen[w].Isout) {
            overbyover[i].Batsmen[w].id = w;
            overObj.totalWicket.push(overbyover[i].Batsmen[w]);
          }
        }

        for (var b in overbyover[i].Bowlers) {
          overObj.Bowler = overbyover[i].Bowlers[b].Bowler;
        }
        overs[i] = overs[i] || [];
        overs[i].push(overObj);
      }
    }

    vueInstance.widgetData["manhattanData"] = manhattanData;
    vueInstance.widgetData.graphsData["overs"] = overs;
    vueInstance.widgetData.graphsData["yAxis"] = yAxis;

    setTimeout(() => {
      new Glider(document.querySelector(".glider"), {
        slidesToShow: "auto",
        slidesToScroll: 5,
        duration: 1,
        arrows: {
          prev: document.querySelector(".glider-prev"),
          next: document.querySelector(".glider-next")
        },
        itemWidth: 58,
        draggable: true
        // responsive: [
        //   {
        //     breakpoint: 400,
        //     settings: {
        //       slidesToShow: 5,
        //       slidesToScroll: "auto",
        //       duration: 0.25
        //     }
        //   }
        // ]
      });
    }, 300);
  }
  callAPI(resp, inn, length, gamecode, type) {
    if (type) this.graphtype = type;
    this.loadGraphsFile(this.graphtype, gamecode, inn)
      .then(graphsresp => {
        resp.widgetData[this.graphtype] = resp.widgetData[this.graphtype] || [];
        resp.widgetData[this.graphtype].push(graphsresp[this.graphtype]);
        if (inn == length) {
          //this.mountMarkup(resp, markUp);
          this.drawManhattan(resp, resp.widgetData[this.graphtype]);
        } else {
          inn++;
          this.callAPI(resp, inn, length, gamecode);
        }
      })
      .catch(function(err) {
        console.log("Error while hydration", err);
      });
  }
  getGraphsData(vueInstance, fileType, isAnimate, gamecode) {
    let promiseArray = [],
      responseData = {},
      requestUrl = "",
      filterId = "",
      session = "";
    var data = vueInstance.widgetData.gameData;
    //let inningNo=vueInstance.widgetData.selectedGraphsInn;
    let inningNo = vueInstance.widgetData.selectedInn + 1;
    //var gamecode = this.gamecode;

    //if(inningNo==0)inningNo=1;

    //requestUrl = apiBasePath+"sifeeds/repocricket/live/json/"+gamecode+"_"+fileType+"_splits_"+inningNo+".json";
    //if(this.isLocal){
    requestUrl = apiBasePath + "cricket/live/json/" + gamecode + "_" + fileType + "_splits_" + inningNo + ".json";
    //}

    this.liveUpdateFiles[fileType + "_splits"] = requestUrl;

    let promiseData = this.commonFunctions
      .apiCall(requestUrl, { isJSON: true })
      .then(response => {
        //this.matchData[gamecode][this.selectedLang][fileType+"_splits_"+inningNo] = this.matchData[gamecode][this.selectedLang][fileType+"_splits_"+inningNo] || {}
        //this.matchData[gamecode][this.selectedLang][fileType+"_splits_"+inningNo] = response;

        this.drawPlayerGraphs(vueInstance, response, fileType, isAnimate, inningNo);
      })
      .catch(err => {
        console.log(err);
      });
    promiseArray.push(promiseData);

    return new Promise((resolve, reject) => {
      Promise.all(promiseArray).then(data => {
        return resolve(responseData);
      });
    });
  }
  getMarketData(vueInstance) {
    var data = vueInstance.widgetData.gameData;
    let promiseArray = [],
      responseData = {},
      requestUrl = "",
      filterId = "",
      session = "";
    var gamecode = data.Matchdetail.Match.Code;
    requestUrl = apiBasePath + "cricket/live/json/markets/" + gamecode + "_markets.json";

    this.liveUpdateFiles["market"] = requestUrl;

    let promiseData = this.commonFunctions
      .apiCall(requestUrl, { isJSON: true })
      .then(response => {
        if (response && response.markets && response.markets.length && response.markets[0].selections) {
          vueInstance.widgetData.staticData.markets = response.markets[0].selections;
        }
      })
      .catch(err => {
        console.log(err);
      });
    promiseArray.push(promiseData);

    return new Promise((resolve, reject) => {
      Promise.all(promiseArray).then(data => {
        return resolve(responseData);
      });
    });
  }
  drawPlayerGraphs(vueInstance, data, fileType, isAnimate, inningNo) {
    //var inningNo=this.vueInstance.selectedGraphsInn+1;
    if (inningNo == 0) inningNo = 1;
    //var data = this.matchData[this.gamecode][this.selectedLang][fileType+"_splits_"+inningNo]
    var playerData = {};

    if (fileType == "batsman") {
      var allShots = [];
      for (var batsman in data.Batsmen) {
        if (data.Batsmen && data.Batsmen[batsman].Shots && data.Batsmen[batsman].Shots.length) {
          for (var j = 0; j < data.Batsmen[batsman].Shots.length; j++) {
            allShots.push(data.Batsmen[batsman].Shots[j]);
          }
        }
      }

      if (allShots && allShots.length) {
        var Shots = allShots;
        (playerData.Shots = allShots),
          (playerData.zone1 = 0),
          (playerData.zone2 = 0),
          (playerData.zone3 = 0),
          (playerData.zone4 = 0),
          (playerData.zone5 = 0),
          (playerData.zone6 = 0),
          (playerData.zone7 = 0),
          (playerData.zone8 = 0);

        playerData.run0 = 0;
        playerData.run1 = 0;
        playerData.run2 = 0;
        playerData.run3 = 0;
        playerData.run4 = 0;
        playerData.run5 = 0;
        playerData.run6 = 0;
        playerData.run7 = 0;
        playerData.maxZone = 0;

        for (var i = 0; i < Shots.length; i++) {
          var zones = Shots[i].Zone;
          var _runs = Shots[i].Runs;

          playerData["zone" + zones] = parseInt(playerData["zone" + zones]) + parseInt(Shots[i].Runs);
          if (playerData.maxZone <= playerData["zone" + zones]) {
            playerData.maxZone = playerData["zone" + zones];
          }

          playerData["run" + Shots[i].Runs] = parseInt(playerData["run" + Shots[i].Runs]) + 1;
        }
        //this.vueInstance.widgetData.batsmanGraphsData=playerData;
        vueInstance.widgetData.batsmanGraphsData = playerData;

        //if(this.vueInstance.defaulttab=="spider"){
        setTimeout(() => {
          this.spiderDraw(isAnimate, playerData);
        }, 300);
        //}
      }
    }
  }
  spiderDraw(isAnimate, batsman, runsType) {
    CWL.spider = CWL.spider || {};
    CWL.spider.colors = {
      1: "#f4821f",
      2: "#1d35c1",
      3: "#ff18e7",
      4: "#0bac4e",
      6: "#1f90f4",
      region: "#1d1d1d",
      circle: "#1d1d1d"
    };
    var svgCnt = document.getElementById("si-spider-svg-container-graph");

    if (!svgCnt) return true;

    if (svgCnt && svgCnt.querySelector("svg")) {
      svgCnt.innerHTML = "";
      isAnimate = false;
    }

    //var ow = svgCnt.offsetWidth,oh = svgCnt.offsetHeight,cx = (ow / 2),cy = (oh / 2)-15,radius = cx;
    var ow = 185,
      oh = 185,
      cx = ow / 2,
      cy = oh / 2 - 15,
      radius = cx;
    var paper = new Raphael(svgCnt, ow, oh);

    CWL.svg = {
      cx: cx,
      cy: cy,
      cr: radius,
      paper: paper
    };

    var style = batsman.Style || "RHB";
    style = style.toLowerCase();

    var shotsArr = batsman.Shots;
    for (var i = 0; i < shotsArr.length; i++) {
      var shot = shotsArr[i];
      if (runsType && runsType != shot.Runs && runsType !== "all") continue;

      var dist = shot.Distance > 5 ? 5 : shot.Distance;
      var angle = parseInt(shot.Angle);

      if (shot.Runs == 6 || shot.Runs == 4) {
        if (angle < 90) {
          dist = radius - angle / 7.2;
        } else if (angle < 90 && angle > 90) {
          dist = radius - angle / 7.2 / 2;
        } else if (angle <= 270 && angle > 180) {
          dist = radius + angle / 5.14 / 3;
        } else {
          dist = radius + (angle / 4 - 90 / 5.14);
        }
      } else {
        if (angle < 180) {
          dist = ((radius - 15) * dist) / 4.5;
        } else {
          dist = (radius * dist) / 4.5;
        }
      }
      var xd = dist,
        x2 = cx + xd,
        y2 = cy,
        newAngle = -1 * parseInt(angle);
      var endPts = CWL.drawing.rotate(CWL.svg.cx, CWL.svg.cy, newAngle, x2, y2);
      var attrs = {
        stroke: CWL.spider.colors[shot.Runs],
        "stroke-width": "1.5px",
        opacity: "1",
        runs: shot.Runs,
        zone: shot.Zone
      };

      var lPara = { paper: paper, x1: cx, y1: cy, x2: endPts.x, y2: endPts.y, animate: isAnimate, attrs: attrs };
      var line = CWL.drawing.line(lPara);
    }
  }
  loadGraphsFile(type, gamecode, inn) {
    let promiseArray = [],
      responseData = {};
    var requestUrl = apiBasePath + "cricket/live/json/" + gamecode + "_overbyover_" + inn + ".json";

    this.liveUpdateFiles[type] = requestUrl;
    let promiseData = this.commonFunctions
      .apiCall(requestUrl, { isJSON: true })
      .then(response => {
        var totalRuns = 0,
          maxrun = 0,
          maxrunrate = 0;
        for (var i = 0; i < response.Overbyover.length; i++) {
          totalRuns += parseInt(response.Overbyover[i].Runs);
          response.Overbyover[i]["totalRuns"] = totalRuns;
          response.Overbyover[i]["runRate"] = totalRuns / (i + 1);

          if (parseInt(maxrun) < parseInt(response.Overbyover[i].Runs)) {
            maxrun = response.Overbyover[i].Runs;
          }
          if (parseInt(maxrunrate) < parseInt(response.Overbyover[i].runRate)) {
            maxrunrate = response.Overbyover[i].runRate;
          }
        }
        response["maxrunrate"] = maxrunrate;
        response["maxrun"] = maxrun;

        return (responseData[type] = response);
      })
      .catch(err => {
        console.log(err);
      });
    promiseArray.push(promiseData);

    return new Promise((resolve, reject) => {
      Promise.all(promiseArray).then(data => {
        return resolve(responseData);
      });
    });
  }

  runrateDraw(data, chartbased) {
    var thisRef = this;
    var maxrunrate = 0,
      maxrun = 0,
      maxover = 0,
      maxTotal = 0;

    if (data.graphs.length) {
      maxrunrate = data.graphs[0].maxrunrate;
      maxrun = data.graphs[0].maxrun;
      maxTotal = data.graphs[0].Overbyover[data.graphs[0].Overbyover.length - 1].totalRuns;
      maxover = data.graphs[0].Overbyover.length;
    }

    if (data.graphs.length == 2) {
      if (maxrun < data.graphs[1].maxrun) {
        maxrun = data.graphs[1].maxrun;
      }

      if (maxrunrate < data.graphs[1].maxrunrate) {
        maxrunrate = data.graphs[1].maxrunrate;
      }
      if (maxTotal < data.graphs[1].Overbyover[data.graphs[1].Overbyover.length - 1].totalRuns) {
        maxTotal = data.graphs[1].Overbyover[data.graphs[1].Overbyover.length - 1].totalRuns;
      }

      if (maxover < data.graphs[1].Overbyover.length) {
        maxover = data.graphs[1].Overbyover.length;
      }
    }
    var start = 0,
      end = maxover; //overbyover.length;

    /** xLabels  START */
    var xLabels = [];
    for (var ix = start; ix < end; ix++) {
      var label = ix;
      if (label % 5 === 0) {
        xLabels.push(label);
      } else {
        xLabels.push("");
      }
    }
    xLabels.push(end);
    /** xLabels  END */
    /** dataSets  START */

    function getWicketDetail(playerId, playerName) {
      var mkp = '<em class="si-txt si-txt1">' + playerName + "</em>";
      var innings = data.gameData.Innings;
      if (playerName == "needhowout") {
        for (var i = 0; i < innings.length; i++) {
          for (var k = 0; k < innings[i].Batsmen.length; k++) {
            if (innings[i].Batsmen[k].Batsman == playerId) {
              mkp = innings[i].Batsmen[k].Howout;
              break;
            }
          }
        }
      } else {
        if (data && data.gameData && data.gameData.Innings) {
          for (var i = 0; i < innings.length; i++) {
            for (var k = 0; k < innings[i].Batsmen.length; k++) {
              if (innings[i].Batsmen[k].Batsman == playerId) {
                mkp =
                  '<em class="si-txt si-txt1">' +
                  playerName +
                  " (" +
                  innings[i].Batsmen[k].Runs +
                  ') </em><em class="si-txt si-txt2">' +
                  innings[i].Batsmen[k].Howout +
                  "</em>";
                break;
              }
            }
          }
        }
      }
      return mkp;
    }

    function fnGetDataSet(inn) {
      var overByOver = data.graphs[inn].Overbyover;

      var lineData = [""],
        wicketData = [""];
      for (var ix = 0; ix < overByOver.length; ix++) {
        var over = overByOver[ix];

        if (!over) {
          continue;
        }

        var runRate = over[chartbased] || 0;
        lineData.push(parseInt(runRate));

        over.totalWicket = [];
        var wickets = over.totalWicket;
        for (var w in overByOver[ix].Batsmen) {
          if (overByOver[ix].Batsmen[w].Isout) {
            overByOver[ix].Batsmen[w].id = w;
            over.totalWicket.push(overByOver[ix].Batsmen[w]);
          }
        }

        if (over.totalWicket && over.totalWicket.length) {
          for (var w = 0; w < over.totalWicket.length; w++) {
            var hout = getWicketDetail(over.totalWicket[w].id, "needhowout");
            over.totalWicket[w].howOut = hout;
            over.totalWicket[w].howOut = "";
          }
          wickets = over.totalWicket;
          if (chartbased == "runRate") {
            wickets = "";
          }
        }

        wicketData.push(wickets);
      }

      if (inn == 0) {
        var rgba = "rgba(159,207,0,0.3)";
        var colorcode = "25, 119, 255";
        if (data.gameData.Innings[inn].Battingteam == data.gameData.Matchdetail.Team_Home) {
          // colorcode = "25, 119, 255";
          colorcode = "16, 60, 140";
        } else {
          // colorcode = "57, 0, 125";
          colorcode = "255, 93, 43";
        }
        var dataSet = {
          label: "My First dataset",
          fillColor: "rgba(" + colorcode + ",0.3)",
          //"strokeColor": "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",1)",
          strokeColor: "rgba(" + colorcode + ",1)",
          pointColor: "red",
          pointStrokeColor: "red",
          pointHighlightFill: "red",
          pointHighlightStroke: "rgba(119,0,0,0.6)",
          data: lineData,
          wickets: wicketData
          // "datasetStrokeWidth": 2,
        };
      } else {
        var rgba = "rgba(159,207,0,0.3)";
        var colorcode = "57, 0, 125";
        if (data.gameData.Innings[inn].Battingteam == data.gameData.Matchdetail.Team_Away) {
          // colorcode = "57, 0, 125";
          colorcode = "255, 93, 43";
        } else {
          // colorcode = "25, 119, 255";
          colorcode = "16, 60, 140";
        }
        var dataSet = {
          label: "My Second dataset",
          fillColor: "rgba(" + colorcode + ",0.3)",
          //"strokeColor": "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",1)",
          strokeColor: "rgba(" + colorcode + ",1)",
          pointColor: "red",
          pointStrokeColor: "red",
          pointHighlightFill: "red",
          pointHighlightStroke: "rgba(207,0,0,0.6)",
          data: lineData,
          wickets: wicketData
          // "datasetStrokeWidth": 2,
        };
      }

      //return dataSet;
      dataSets.push(dataSet);

      if (inn < data.graphs.length - 1) {
        inn++;
        fnGetDataSet(inn);
      }
    }
    var dataSets = [],
      set,
      count = 0;
    fnGetDataSet(0);

    /** dataSets  END */
    var chartData = {
      labels: xLabels,
      datasets: dataSets
    };

    var showXLabels = 5;
    if (chartbased == "totalRuns") {
      var yMax = Math.max(maxTotal || 0);
    } else {
      var yMax = Math.max(maxrunrate || 0);
      //var yMax = Math.max((maxrun || 0));
    }

    var adder = Math.ceil(parseInt(yMax) / showXLabels);

    var chartOptions = {
      scaleShowHorizontalLines: false,
      scaleGridLineColor: "rgba(0,0,0,0.1)",
      scaleShowVerticalLines: false,
      bezierCurve: true,
      pointDot: true,
      pointDotRadius: 10,
      showTooltips: true,
      pointDotStrokeWidth: 1,
      pointHitDetectionRadius: 7,
      datasetStroke: true,
      datasetStrokeWidth: 3,
      datasetFill: true,
      showXLabels: showXLabels,
      scaleLineColor: "rgba(0,0,0,0.4)",
      scaleLineWidth: 1,
      animation: false,
      scaleOverride: true,
      scaleSteps: showXLabels,
      scaleStepWidth: adder
    };

    setTimeout(() => {
      var canvasElement = document.getElementById("runrateWormCanvas1");
      if (canvasElement) {
        canvasElement.parentNode.removeChild(canvasElement);
        //this.chart=""
      }
      var runCnt = document.querySelector(".runrate-worm-graph");
      //runCnt.innerHTML = "";
      runCnt.innerHTML =
        '<canvas class="runrateWormCanvas" id="runrateWormCanvas1" style="height: 280px; width: 100%;" width="100%" height="280"></canvas>';
      setTimeout(() => {
        var ctx1 = document.getElementById("runrateWormCanvas1").getContext("2d");
        if (chartbased == "totalRuns") {
          this.setTooltip();
        }
        this.chart = new Chart(ctx1).Line(chartData, chartOptions);
      }, 100);
    }, 200);
  }

  getLastSixballs(vueInstance, gamecode, inningNo) {
    var match_id = vueInstance.widgetData.gameData.Matchdetail.Match.Id;
    inningNo = vueInstance.widgetData.gameData.Innings ? vueInstance.widgetData.gameData.Innings.length : 1;

    let session = inningNo ? inningNo : 1;
    let client_id = "rPhqZfQFgusvF4M1mwvuEA==";
    let requestUrl =
      apiBasePath +
      "functions/wallstream/?sport_id=1&client_id=" +
      client_id +
      "&match_id=" +
      match_id +
      "&page_size=20&page_no=1&asset_type_id=2&session=" +
      session;

    this.commonFunctions
      .apiCall(requestUrl, { isJSON: true })
      .then(resp => {
        var lastSixBalls = [];
        var commAssets = resp.assets ? resp.assets : "";
        for (var i = 0; i < commAssets.length; i++) {
          var a = commAssets[i],
            asset = "";
          var aData = a.custom_metadata && a.custom_metadata.asset;
          if (aData && aData.length) {
            try {
              aData = aData.replace(/\r?\n|\r/g, " ");
              aData = aData.replace(/\t/g, "    ");
              aData = JSON.parse(aData);
              if (aData.Isball && lastSixBalls.length < 6) {
                aData.id = a.id;
                lastSixBalls.unshift(aData);
              }
            } catch (e) {
              console.warn(e.stack);
            }
          }
        }
        vueInstance.widgetData.staticData.lastSixBalls = lastSixBalls;
      })
      .catch(err => {
        console.log(err);
      });
  }

  setTooltip() {
    Chart.types.Line.extend({
      getPointsAtEvent: function(e) {
        var pointsArray = [],
          eventPosition = Chart.helpers.getRelativePosition(e);
        Chart.helpers.each(
          this.datasets,
          function(dataset) {
            Chart.helpers.each(dataset.points, function(point, overNo) {
              var inR = point.inRange(eventPosition.x, eventPosition.y);
              if (inR) {
                point.wicketNo = inR;
                pointsArray.push(point);
              }
            });
          },
          this
        );
        return pointsArray;
      },
      showTooltip: function(ChartElements, forceRedraw) {
        if (typeof this.activeElements === "undefined") this.activeElements = [];
        var isChanged = function(Elements) {
          var changed = false;
          if (Elements.length !== this.activeElements.length) {
            changed = true;
            return changed;
          }
          Chart.helpers.each(
            Elements,
            function(element, index) {
              if (element !== this.activeElements[index]) {
                changed = true;
              }
            },
            this
          );
          return changed;
        }.call(this, ChartElements);

        this.activeElements = ChartElements;

        var tooltipelement = document.querySelector(".cwl-runrate-tooltip");

        if (ChartElements.length > 0) {
          Chart.helpers.each(
            ChartElements,
            function(Element) {
              if (Element.value <= 0) return false;

              var tooltipPosition = Element.tooltipPosition();
              if (Element.wickets.length > 0) {
                var wckt_detail = Element.wickets[0];
                var wno = Element.wicketNo;
                if (wno) {
                  wno = parseInt(wno.split("-")[1]);
                  wckt_detail = Element.wickets[wno - 1];
                }

                if (!wckt_detail) {
                  document.querySelector(".cwl-runrate-tooltip").setAttribute("style", "display:none;");
                  //return;
                }
                var canvasWidth = parseInt(document.getElementById("runrateWormCanvas1").style.width);

                var runs = wckt_detail.Runs;
                runs = runs == 1 ? runs + " Run" : runs + " Runs";
                var howOut = wckt_detail.howOut;
                var left = Math.round(tooltipPosition.x) + 5;
                var top = Math.round(tooltipPosition.y) + 5;

                if (Element.x > canvasWidth - tooltipelement.offsetWidth) {
                  var _w = tooltipelement.offsetWidth / 2;
                  left -= _w;
                }

                var firstChild = document.querySelector(".cwl-runrate-tooltip .full-name");
                if (firstChild) firstChild.innerHTML = wckt_detail.Batsman;

                document.querySelector(".cwl-runrate-tooltip .si-runs").innerHTML = runs;
                document.querySelector(".cwl-runrate-tooltip .si-howout").innerHTML = wckt_detail.howOut;

                document.querySelector(".cwl-runrate-tooltip").setAttribute("style", "left:" + left + "px;top:" + top + "px;display:block;");
              } else {
                //document.querySelector(".cwl-runrate-tooltip").setAttribute("style", "display:none;");
                document.querySelector(".cwl-runrate-tooltip").setAttribute("style", "display:block;");
              }
            },
            this
          );
        } else {
          document.querySelector(".cwl-runrate-tooltip").setAttribute("style", "display:none;");
        }
        return this;
      }
    });
  }
  mountMarkup(data) {
    let self = this;
    let clientCache = {
      customNames: { en: window.SIWidget.customNames },
      translations: { en: window.SIWidget.translations }
    };

    let customNames = clientCache.customNames;
    let staticData = {};
    staticData.pollTabsRequired = this.pollTabsRequired || false;
    staticData.lastSixBalls = [];
    staticData.predictor = [];
    staticData.markets = [];
    let gObj = {};
    let marketData = [];
    gObj.overs = [];
    gObj.yAxis = [];
    let instanceParams = {
      //clientConfig: this.config,
      clientCache,
      staticData,
      gameData: data,
      graphsData: gObj,
      batsmanGraphsData: {},
      selectedInn: data.Innings ? data.Innings.length - 1 : 0,
      selectedGraphsInn: data.Innings ? data.Innings.length - 1 : 0,
      selectedTeam: 0,
      graphtype: "",
      squads: [],
      commentaryData: [],
      ballinplay: [],
      activePoll: [],
      commAPILoading: true,
      loadmore: false,
      gamecode: this.gamecode,
      defaulttab: this.defaulttab,
      //widgetNode: this.config.widgets.matchCenter.matchCenter,
      selectedLang: this.selectedLang
      //templateMarkup: markupData
    };

    let vueInstance = new Vue(render);
    vueInstance.widgetData = instanceParams;

    var mdt = vueInstance.widgetData.gameData.Matchdetail;
    if (!mdt.isso && (!mdt.Result || mdt.Result == "")) {
      this.getWinPredictorData(vueInstance, mdt);
      this.getMarketData(vueInstance);
      //loading last six ball
      if (vueInstance.widgetData.gameData.Innings && vueInstance.widgetData.gameData.Innings.length) {
        this.getLastSixballs(vueInstance, vueInstance.widgetData.gameData.Innings.length);
      }
    }
    this.getPollsData(vueInstance);

    vueInstance.imagePaths = this.config.imagePaths;
    vueInstance.widgetData.isMobile = this.isMobile === "true" ? true : false;
    this.widgetConfig.container.innerHTML = "";
    vueInstance.widgetData.adComponent = { ad_code: window.adMarkup };
    vueInstance.widgetData.bettingSitesComponent = { ad_code: window.bettingSiteMarkup };
    vueInstance.widgetData.oddsLink = this.oddsLink;
    vueInstance.widgetData.partnerLogo = this.partnerLogo;
    vueInstance.configData = { content: { playerImg: window.imgVersion } };
    vueInstance.$mount(this.widgetConfig.container, true);

    vueInstance.tabSelection = (tab, filter, inningNo) => {
      vueInstance.widgetData.defaulttab = tab;
      if (inningNo || +inningNo == 0) vueInstance.widgetData.selectedInn = inningNo;
      else {
        vueInstance.widgetData.selectedInn = vueInstance.widgetData.gameData.Innings ? vueInstance.widgetData.gameData.Innings.length - 1 : 0;
      }

      var gamsecode = this.gamecode;
      switch (tab) {
        case "commentary":
          //vueInstance.widgetData.selectedInn = inningNo;
          vueInstance.defaultCommTab = filter;
          vueInstance.widgetData.commAPILoading = true;
          vueInstance.widgetData.loadmore = false;
          //vueInstance.widgetData.activePoll=[];
          if (filter != "loadmore") vueInstance.widgetData.commentaryData = [];
          vueInstance.ballinplay = [];

          this.loadCommentary(vueInstance, tab, filter, inningNo);

          break;
        case "scorecard":
          //if(filter=="innings")vueInstance.widgetData.selectedInn = inningNo;
          this.updateScoreCard(vueInstance, filter, vueInstance.widgetData.selectedInn);

          break;
        case "match-info":
          break;
        case "polls":
          this.getPollsData(vueInstance);
          break;
        case "graphs":
          var data = vueInstance.widgetData.gameData;
          var matchType = data.Matchdetail.Match.Type ? data.Matchdetail.Match.Type.toLowerCase() : "";
          var league = data.Matchdetail.Match.League ? data.Matchdetail.Match.League : "";
          var coverageLbl = data.Matchdetail.Match.Coverage_level_id ? data.Matchdetail.Match.Coverage_level_id : 0;

          if (!this.chart) {
            let scriptTag = window.document.createElement("script");
            scriptTag.src = `https://${window.location.host}/static-assets/build/js/chart.js`;
            window.document.getElementsByTagName("head")[0].appendChild(scriptTag);
          }

          if (!filter) {
            filter = "spider";
            if (matchType == "odi" || matchType == "t20" || matchType == "t20i") {
              filter = "manhattan";
            }
          }
          vueInstance.widgetData.graphtype = filter;

          //if(inningNo || inningNo=='0')vueInstance.selectedGraphsInn=inningNo;
          //else vueInstance.selectedGraphsInn = data.Innings ? data.Innings.length-1 : 0

          if (filter == "manhattan" || filter == "ingprg" || filter == "runrate") {
            this.graphtype == "graphs";

            // removing chart
            let chartCnt = document.querySelector(".si-chatswipe");
            ///if(chartCnt)chartCnt.style.display="none"

            // removing canvas
            var canvasElement = document.getElementById("runrateWormCanvas1");
            if (canvasElement) {
              canvasElement.parentNode.removeChild(canvasElement);
            }

            if (vueInstance.widgetData[this.graphtype]) {
              if (filter == "manhattan") {
                this.drawManhattan(vueInstance, vueInstance.widgetData[this.graphtype]);
              } else if (filter == "ingprg" || filter == "runrate") {
                if (chartCnt) chartCnt.style.display = "block";
                if (filter == "ingprg") this.runrateDraw(vueInstance.widgetData, "totalRuns");
                if (filter == "runrate") this.runrateDraw(vueInstance.widgetData, "runRate");
              }
            } else {
              if ((matchType == "odi" || matchType == "t20" || matchType == "t20i") && (league == "ipl" || coverageLbl == "8")) {
                if (this.graphtype == "graphs" && data.Innings && data.Innings.length && data.Innings[data.Innings.length - 1].Overs != "0.0") {
                  this.callAPI(vueInstance, 1, data.Innings.length, this.gameCode);
                } else {
                  //setTimeout(() => {this.hydration()},60*1000)
                }
              }
            }
          } else if (filter == "spider" || filter == "wagonwheel") {
            var isAnimate = true;
            // removing graphs
            var svgCnt = document.getElementById("si-spider-svg-container-graph");
            if (svgCnt && svgCnt.querySelector("svg")) {
              //svgCnt.innerHTML="";
              isAnimate = false;
            }
            if (this.raphael) {
              this.getGraphsData(vueInstance, "batsman", isAnimate, this.gameCode);
            } else {
              let scriptTag = window.document.createElement("script");
              scriptTag.src = `https://${window.location.host}/static-assets/build/js/raphael.min.js`;
              window.document.getElementsByTagName("head")[0].appendChild(scriptTag);
              scriptTag.onload = () => {
                setTimeout(() => {
                  this.raphaelLoaded = true;
                  this.getGraphsData(vueInstance, "batsman", isAnimate, this.gameCode);
                }, 100);
              };
            }
          }
          break;
        default:
          break;
      }

      //if(!this.isLocal)setPageUrl();
      setPageUrl();

      function setPageUrl() {
        if (vueInstance.urlParms && vueInstance.urlParms.length > 1) {
          var _newUrl = "/cricket/scores-fixtures/" + tab + "/" + vueInstance.urlParms[1];
          history.pushState({ page: tab }, tab, _newUrl);
        }

        var _title = window.document.title;

        if (_title.indexOf("|") != -1) {
          var activeTab = tab;
          if (activeTab == "match-info") activeTab = "Match info";

          _title = _title.split("|");
          _title[_title.length - 1] = " " + activeTab;
          var newtitle = _title.join("|");
          window.document.title = newtitle;
        }
      }
    };
    vueInstance.getFanshoutData = (assets, assetId, options, pollStatus) => {
      var fanshoutAPI = "https://www.sportsadda.com/functions/fansentiments?asset_id=" + assetId;

      this.commonFunctions
        .apiCall(fanshoutAPI, { isJSON: true })
        .then(response => {
          calculatePer(response.results);
        })
        .catch(err => {
          console.log(err);
        });
      function calculatePer(results) {
        var _count = "",
          msg = "",
          optmkp = "",
          maxCount = 1,
          msgOwner = "you",
          agree = "agree with ",
          totalCount = 1,
          maxValue = 0;

        for (var r = 0; r < results.length, r < 2; r++) {
          totalCount += results[r].count;
          if (maxValue < results[r].count) maxValue = results[r].count;
          if (maxCount <= results[r].count) {
            maxCount = results[r].count;
            _count = results[r].count;
            msgOwner = options[r];
            //agree = "think ";
          }
        }

        for (var r = 0; r < results.length, r < 2; r++) {
          results[r].per = getPercentage(results[r].count, r);
        }
        var usersAns = localStorage.getItem(assetId);

        if (!usersAns) {
          if (maxCount == 1) {
            msg = maxCount + " Fan think with " + msgOwner;
          } else msg = maxCount + " Fans think with " + msgOwner;
        } else {
          if (usersAns && usersAns.indexOf(":") != -1) {
            var _userAns = usersAns.split(":")[1];
            maxCount = results[_userAns].count;
          }
          msg = maxCount + " Fans agree with you";
        }

        for (var c = 0; c < vueInstance.widgetData.activePoll.length; c++) {
          if (assetId == vueInstance.widgetData.activePoll[c].id) {
            (assets.msgOwner = msg), (assets.results = results);
            vueInstance.widgetData.activePoll[c] = assets;
            break;
          }
        }

        function getPercentage(number, index) {
          var per = number;
          if (!per || per == 0) per = 0;
          else {
            var len = results.length;
            if (len > 2) len = 2;
            if (index == len - 1) {
              var tillCountPer = 0;
              for (var r = 0; r < len - 1; r++) {
                tillCountPer += Math.round((results[r].count / totalCount) * 100);
              }
              per = 100 - tillCountPer;
            } else per = Math.round((number / totalCount) * 100);
          }
          return per + "%";
        }
      }
    };

    vueInstance.postFanshoutData = (pollAsset, assetId, optionId, pollStatus, options) => {
      var api = "https://www.sportsadda.com/functions/fansentiments";
      var xhr = new XMLHttpRequest();
      xhr.open("POST", api, true);
      xhr.setRequestHeader("X-Operation-Type", "count");
      xhr.send(JSON.stringify({ asset_id: assetId, sentiments: ["" + assetId + ":" + optionId + ""] }));
      xhr.onreadystatechange = function() {
        if (this.readyState != 4) return;
        if (this.status == 200) {
          var key = assetId;
          var val = assetId + ":" + optionId + ":" + options;
          localStorage.setItem(key, val);
          vueInstance.getFanshoutData(pollAsset, assetId, options, false);
          vueInstance.checkUnAnswerPoll();
        }
      };
    };
    vueInstance.checkUnAnswerPoll = () => {
      var a = 0;
      for (var i = 0; i < vueInstance.widgetData.activePoll.length; i++) {
        var assetId = vueInstance.widgetData.activePoll[i].id;
        var usersAns = localStorage.getItem(assetId);
        if (!usersAns && !vueInstance.widgetData.activePoll[i].results.length) {
          a++;
        }
      }
      return a == 0 ? "" : '<em class="si-notify-indication">' + a + "</em>";
    };
    vueInstance.checkAnsweredPoll = () => {
      var a = 0;
      for (var i = 0; i < vueInstance.widgetData.activePoll.length; i++) {
        var assetId = vueInstance.widgetData.activePoll[i].id;
        var usersAns = localStorage.getItem(assetId);
        if (usersAns) {
          a++;
        }
      }
      return a;
    };

    this.vueInstance = vueInstance;
    vueInstance.tabSelection(this.defaulttab);

    var _href = window.location.href,
      defaultPage,
      defaultGamecode;
    if (_href.indexOf("/scores-fixtures/") != -1) {
      var parts = _href.split("/scores-fixtures/")[1].split("/");
      vueInstance.urlParms = parts;
      (defaultPage = parts[0]), defaultGamecode;
    }
    // live updates
    if (this.globalTimer) clearInterval(this.globalTimer);
    if (vueInstance.widgetData.gameData.Matchdetail && !vueInstance.widgetData.gameData.Matchdetail.Result) {
      this.globalTimer = setInterval(() => {
        this.updateData(vueInstance);
      }, 17 * 1000);
    }
  }
  getCustomeTeamName(teamId, sortName, actualName) {
    var newName = actualName;
    var customName = window.SIWidget.customNames;
    if (customName) {
      //customName=JSON.parse(customName)[this.selectedLang];
      if (customName && customName.teams.cricket && customName.teams.cricket[teamId]) {
        var _t = customName.teams.cricket[teamId];
        if (sortName) newName = _t.custom_short_name;
        else if (!sortName) newName = _t.custom_name;
      }
    }
    return newName;
  }
  updateData(vueInstance) {
    for (let file in this.liveUpdateFiles) {
      /* if(push_SDK.pushConnected && (file=="matchfile" || file=="gameData" || file=="commentary")){
			continue
		} */

      //if(file=="polls" && vueInstance.defaulttab=="commentary" && push_SDK.pushConnected){continue}
      //console.log("file--"+file, this.liveUpdateFiles[file])

      // if (file == "polls" && vueInstance.defaulttab != "polls") {
      //   continue;
      // }
      if (
        file == "graphs" &&
        vueInstance.defaulttab != "graphs" &&
        vueInstance.widgetData.graphtype != "manhattan" &&
        vueInstance.widgetData.graphtype != "ingprg" &&
        vueInstance.widgetData.graphtype != "runrate"
      ) {
        continue;
      }
      if (
        file == "batsman_splits" &&
        vueInstance.defaulttab != "graphs" &&
        vueInstance.widgetData.graphtype != "spider" &&
        vueInstance.widgetData.graphtype != "wagonwheel"
      ) {
        continue;
      }

      let promiseData = this.commonFunctions
        .apiCall(this.liveUpdateFiles[file], { isJSON: true })
        .then(response => {
          if (file == "matchfile" || file == "gameData") {
            var obj = {};
            obj.gameData = response;
            //connecting push
            /* if(response && response.Matchdetail && response.Matchdetail.Tosswonby && response.Matchdetail.Tosswonby!='' && !push_SDK.pushConnected && !window.testingData && !push_SDK.pushStoped){
						if(response.Matchdetail.Status_Id!='120'){
							//this.pushconnect(this.vueInstance,this.gamecode,this);
						}else this.parseData(response,'onUpdate');
						
					}else */ this.parseData(
              obj,
              "onUpdate",
              vueInstance
            );
          } else if (file == "commentary" || file == "polls" || file == "wktsCommentary") {
            //this.updateCommentary(this.vueInstance,response.assets,"onUpdate")
            var _assets = response.assets && response.assets.length ? response.assets.reverse() : response.assets;
            if (_assets) this.updateCommentary(vueInstance, _assets, "onUpdate");
          } else if (file == "winpredictor") {
            if (response && response.predictor) {
              for (var i = 0; i < response.predictor.length; i++) {
                response.predictor[i].team_name = this.getCustomeTeamName(response.predictor[i].team_id, false, response.predictor[i].team_name);
                response.predictor[i].team_short_name = this.getCustomeTeamName(
                  response.predictor[i].team_id,
                  true,
                  response.predictor[i].team_short_name
                );
              }
              vueInstance.widgetData.staticData.predictor = response.predictor;
            }
          } else if (file == "graphs") {
            if (response) {
              if (vueInstance.widgetData.manhattanData) {
                var totalRuns = 0,
                  maxrun = 0,
                  maxrunrate = 0;
                for (var i = 0; i < response.Overbyover.length; i++) {
                  totalRuns += parseInt(response.Overbyover[i].Runs);
                  response.Overbyover[i]["totalRuns"] = totalRuns;
                  response.Overbyover[i]["runRate"] = totalRuns / (i + 1);

                  if (parseInt(maxrun) < parseInt(response.Overbyover[i].Runs)) {
                    maxrun = response.Overbyover[i].Runs;
                  }
                  if (parseInt(maxrunrate) < parseInt(response.Overbyover[i].runRate)) {
                    maxrunrate = response.Overbyover[i].runRate;
                  }
                }
                response["maxrunrate"] = maxrunrate;
                response["maxrun"] = maxrun;
                vueInstance.widgetData.manhattanData[vueInstance.widgetData.manhattanData.length - 1] = response;

                if (vueInstance.widgetData.graphtype == "manhattan") {
                  this.drawManhattan(vueInstance, vueInstance.widgetData.manhattanData);
                } else if (vueInstance.widgetData.graphtype == "ingprg") {
                  this.runrateDraw(vueInstance.widgetData, "totalRuns");
                } else if (vueInstance.widgetData.graphtype == "runrate") {
                  this.runrateDraw(vueInstance.widgetData, "runRate");
                }
              }
            }
          } else if (file == "bowler_splits" || file == "batsman_splits") {
            let inningNo = vueInstance.widgetData.selectedInn + 1;
            this.drawPlayerGraphs(vueInstance, response, "batsman", true, inningNo);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};

window.SIWidget.SIClass = window.SIWidget.SIClass || {};
window.SIWidget.SIClass["cricketScorecard"] = SIClass;

var CWL = {};
CWL.drawing = {};
CWL.drawing.circle = function(cParas) {
  if (!(cParas.paper && cParas.cx && cParas.cy && cParas.cr)) {
    return;
  }
  var circle = cParas.paper.circle(cParas.cx, cParas.cy, cParas.cr);
  if (cParas.attrs) {
    circle.attr(cParas.attrs);
  }
  return circle;
};
CWL.drawing.line = function(lParas) {
  if (!(lParas.paper && lParas.x1 && lParas.y1 && lParas.x2 && lParas.y2)) {
    return;
  }

  var mTo = "M" + lParas.x1 + "," + lParas.y1;
  var lTo = "L" + lParas.x2 + "," + lParas.y2;
  var delay = 0;

  if (lParas.animate) {
    delay = 500;
  }

  var line = lParas.paper.path(mTo).animate({ path: mTo + lTo }, delay);
  if (lParas.attrs) {
    line.attr(lParas.attrs);
  }
  return line;
};
CWL.drawing.sector = function(paper, cx, cy, r, startAngle, endAngle, params) {
  var rad = Math.PI / 180;
  var x1 = cx + r * Math.cos(-startAngle * rad),
    x2 = cx + r * Math.cos(-endAngle * rad),
    y1 = cy + r * Math.sin(-startAngle * rad),
    y2 = cy + r * Math.sin(-endAngle * rad);
  return paper.path(["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
};
CWL.drawing.rotate = function(cx, cy, angleInDegree, destPointX, destPointY) {
  var angle = (angleInDegree / 180) * Math.PI;
  var s = Math.sin(angle);
  var c = Math.cos(angle);
  // translate point back to origin:
  destPointX -= cx;
  destPointY -= cy;

  // rotate point
  var xnew = destPointX * c - destPointY * s;
  var ynew = destPointX * s + destPointY * c;
  var outObj = { x: xnew + cx, y: ynew + cy };
  return outObj;
};

!(function(e) {
  "function" == typeof define && define.amd ? define(e) : "object" == typeof exports ? (module.exports = e()) : e();
})(function() {
  var n = "undefined" != typeof window ? window : this,
    e = (n.Glider = function(e, t) {
      var i = this;
      if (e._glider) return e._glider;
      if (
        ((i.ele = e),
        i.ele.classList.add("glider"),
        ((i.ele._glider = i).opt = Object.assign(
          {},
          {
            slidesToScroll: 1,
            slidesToShow: 1,
            resizeLock: !0,
            duration: 0.5,
            easing: function(e, t, i, o, r) {
              return o * (t /= r) * t + i;
            }
          },
          t
        )),
        (i.animate_id = i.page = i.slide = 0),
        (i.arrows = {}),
        (i._opt = i.opt),
        i.opt.skipTrack)
      )
        i.track = i.ele.children[0];
      else
        for (i.track = document.createElement("div"), i.ele.appendChild(i.track); 1 !== i.ele.children.length; )
          i.track.appendChild(i.ele.children[0]);
      i.track.classList.add("glider-track"),
        i.init(),
        (i.resize = i.init.bind(i, !0)),
        i.event(i.ele, "add", { scroll: i.updateControls.bind(i) }),
        i.event(n, "add", { resize: i.resize });
    }),
    t = e.prototype;
  return (
    (t.init = function(e, t) {
      var i = this,
        o = 0,
        r = 0;
      (i.slides = i.track.children),
        [].forEach.call(i.slides, function(e, t) {
          e.classList.add("glider-slide"), e.setAttribute("data-gslide", t);
        }),
        (i.containerWidth = i.ele.clientWidth);
      var s = i.settingsBreakpoint();
      if (((t = t || s), "auto" === i.opt.slidesToShow || void 0 !== i.opt._autoSlide)) {
        var l = i.containerWidth / i.opt.itemWidth;
        i.opt._autoSlide = i.opt.slidesToShow = i.opt.exactWidth ? l : Math.max(1, Math.floor(l));
      }
      "auto" === i.opt.slidesToScroll && (i.opt.slidesToScroll = Math.floor(i.opt.slidesToShow)),
        (i.itemWidth = i.opt.exactWidth ? i.opt.itemWidth : i.containerWidth / i.opt.slidesToShow),
        [].forEach.call(i.slides, function(e) {
          (e.style.height = "auto"), (e.style.width = i.itemWidth + "px"), (o += i.itemWidth), (r = Math.max(e.offsetHeight, r));
        }),
        (i.track.style.width = o + "px"),
        (i.trackWidth = o),
        (i.isDrag = !1),
        (i.preventClick = !1),
        i.opt.resizeLock && i.scrollTo(i.slide * i.itemWidth, 0),
        (s || t) && (i.bindArrows(), i.buildDots(), i.bindDrag()),
        i.updateControls(),
        i.emit(e ? "refresh" : "loaded");
    }),
    (t.bindDrag = function() {
      var t = this;
      t.mouse = t.mouse || t.handleMouse.bind(t);
      function e() {
        (t.mouseDown = void 0), t.ele.classList.remove("drag"), t.isDrag && (t.preventClick = !0), (t.isDrag = !1);
      }
      var i = {
        mouseup: e,
        mouseleave: e,
        mousedown: function(e) {
          e.preventDefault(), e.stopPropagation(), (t.mouseDown = e.clientX), t.ele.classList.add("drag");
        },
        mousemove: t.mouse,
        click: function(e) {
          t.preventClick && (e.preventDefault(), e.stopPropagation()), (t.preventClick = !1);
        }
      };
      t.ele.classList.toggle("draggable", !0 === t.opt.draggable), t.event(t.ele, "remove", i), t.opt.draggable && t.event(t.ele, "add", i);
    }),
    (t.buildDots = function() {
      var e = this;
      if (e.opt.dots) {
        if (("string" == typeof e.opt.dots ? (e.dots = document.querySelector(e.opt.dots)) : (e.dots = e.opt.dots), e.dots)) {
          (e.dots.innerHTML = ""), e.dots.classList.add("glider-dots");
          for (var t = 0; t < Math.ceil(e.slides.length / e.opt.slidesToShow); ++t) {
            var i = document.createElement("button");
            (i.dataset.index = t),
              i.setAttribute("aria-label", "Page " + (t + 1)),
              i.setAttribute("role", "tab"),
              (i.className = "glider-dot " + (t ? "" : "active")),
              e.event(i, "add", { click: e.scrollItem.bind(e, t, !0) }),
              e.dots.appendChild(i);
          }
        }
      } else e.dots && (e.dots.innerHTML = "");
    }),
    (t.bindArrows = function() {
      var i = this;
      i.opt.arrows
        ? ["prev", "next"].forEach(function(e) {
            var t = i.opt.arrows[e];
            t &&
              ("string" == typeof t && (t = document.querySelector(t)),
              t &&
                ((t._func = t._func || i.scrollItem.bind(i, e)),
                i.event(t, "remove", { click: t._func }),
                i.event(t, "add", { click: t._func }),
                (i.arrows[e] = t)));
          })
        : Object.keys(i.arrows).forEach(function(e) {
            var t = i.arrows[e];
            i.event(t, "remove", { click: t._func });
          });
    }),
    (t.updateControls = function(e) {
      var d = this;
      e && !d.opt.scrollPropagate && e.stopPropagation();
      var t = d.containerWidth >= d.trackWidth;
      d.opt.rewind ||
        (d.arrows.prev &&
          (d.arrows.prev.classList.toggle("disabled", d.ele.scrollLeft <= 0 || t),
          d.arrows.prev.classList.contains("disabled")
            ? d.arrows.prev.setAttribute("aria-disabled", !0)
            : d.arrows.prev.setAttribute("aria-disabled", !1)),
        d.arrows.next &&
          (d.arrows.next.classList.toggle("disabled", Math.ceil(d.ele.scrollLeft + d.containerWidth) >= Math.floor(d.trackWidth) || t),
          d.arrows.next.classList.contains("disabled")
            ? d.arrows.next.setAttribute("aria-disabled", !0)
            : d.arrows.next.setAttribute("aria-disabled", !1))),
        (d.slide = Math.round(d.ele.scrollLeft / d.itemWidth)),
        (d.page = Math.round(d.ele.scrollLeft / d.containerWidth));
      var c = d.slide + Math.floor(Math.floor(d.opt.slidesToShow) / 2),
        h = Math.floor(d.opt.slidesToShow) % 2 ? 0 : c + 1;
      1 === Math.floor(d.opt.slidesToShow) && (h = 0),
        d.ele.scrollLeft + d.containerWidth >= Math.floor(d.trackWidth) && (d.page = d.dots ? d.dots.children.length - 1 : 0),
        [].forEach.call(d.slides, function(e, t) {
          var i = e.classList,
            o = i.contains("visible"),
            r = d.ele.scrollLeft,
            s = d.ele.scrollLeft + d.containerWidth,
            l = d.itemWidth * t,
            a = l + d.itemWidth;
          [].forEach.call(i, function(e) {
            /^left|right/.test(e) && i.remove(e);
          }),
            i.toggle("active", d.slide === t),
            c === t || (h && h === t)
              ? i.add("center")
              : (i.remove("center"), i.add([t < c ? "left" : "right", Math.abs(t - (t < c ? c : h || c))].join("-")));
          var n = Math.ceil(l) >= Math.floor(r) && Math.floor(a) <= Math.ceil(s);
          i.toggle("visible", n), n !== o && d.emit("slide-" + (n ? "visible" : "hidden"), { slide: t });
        }),
        d.dots &&
          [].forEach.call(d.dots.children, function(e, t) {
            e.classList.toggle("active", d.page === t);
          }),
        e &&
          d.opt.scrollLock &&
          (clearTimeout(d.scrollLock),
          (d.scrollLock = setTimeout(function() {
            clearTimeout(d.scrollLock),
              0.02 < Math.abs(d.ele.scrollLeft / d.itemWidth - d.slide) &&
                (d.mouseDown || (d.trackWidth > d.containerWidth + d.ele.scrollLeft && d.scrollItem(d.getCurrentSlide())));
          }, d.opt.scrollLockDelay || 250)));
    }),
    (t.getCurrentSlide = function() {
      var e = this;
      return e.round(e.ele.scrollLeft / e.itemWidth);
    }),
    (t.scrollItem = function(e, t, i) {
      i && i.preventDefault();
      var o = this,
        r = e;
      if ((++o.animate_id, !0 === t)) (e *= o.containerWidth), (e = Math.round(e / o.itemWidth) * o.itemWidth);
      else {
        if ("string" == typeof e) {
          var s = "prev" === e;
          if (
            ((e = o.opt.slidesToScroll % 1 || o.opt.slidesToShow % 1 ? o.getCurrentSlide() : o.slide),
            s ? (e -= o.opt.slidesToScroll) : (e += o.opt.slidesToScroll),
            o.opt.rewind)
          ) {
            var l = o.ele.scrollLeft;
            e = s && !l ? o.slides.length : !s && l + o.containerWidth >= Math.floor(o.trackWidth) ? 0 : e;
          }
        }
        (e = Math.max(Math.min(e, o.slides.length), 0)), (o.slide = e), (e = o.itemWidth * e);
      }
      return (
        o.scrollTo(e, o.opt.duration * Math.abs(o.ele.scrollLeft - e), function() {
          o.updateControls(), o.emit("animated", { value: r, type: "string" == typeof r ? "arrow" : t ? "dot" : "slide" });
        }),
        !1
      );
    }),
    (t.settingsBreakpoint = function() {
      var e = this,
        t = e._opt.responsive;
      if (t) {
        t.sort(function(e, t) {
          return t.breakpoint - e.breakpoint;
        });
        for (var i = 0; i < t.length; ++i) {
          var o = t[i];
          if (n.innerWidth >= o.breakpoint)
            return e.breakpoint !== o.breakpoint && ((e.opt = Object.assign({}, e._opt, o.settings)), (e.breakpoint = o.breakpoint), !0);
        }
      }
      var r = 0 !== e.breakpoint;
      return (e.opt = Object.assign({}, e._opt)), (e.breakpoint = 0), r;
    }),
    (t.scrollTo = function(t, i, o) {
      var r = this,
        s = new Date().getTime(),
        l = r.animate_id,
        a = function() {
          var e = new Date().getTime() - s;
          (r.ele.scrollLeft = r.ele.scrollLeft + (t - r.ele.scrollLeft) * r.opt.easing(0, e, 0, 1, i)),
            e < i && l === r.animate_id ? n.requestAnimationFrame(a) : ((r.ele.scrollLeft = t), o && o.call(r));
        };
      n.requestAnimationFrame(a);
    }),
    (t.removeItem = function(e) {
      var t = this;
      t.slides.length && (t.track.removeChild(t.slides[e]), t.refresh(!0), t.emit("remove"));
    }),
    (t.addItem = function(e) {
      this.track.appendChild(e), this.refresh(!0), this.emit("add");
    }),
    (t.handleMouse = function(e) {
      var t = this;
      t.mouseDown && ((t.isDrag = !0), (t.ele.scrollLeft += (t.mouseDown - e.clientX) * (t.opt.dragVelocity || 3.3)), (t.mouseDown = e.clientX));
    }),
    (t.round = function(e) {
      var t = 1 / (this.opt.slidesToScroll % 1 || 1);
      return Math.round(e * t) / t;
    }),
    (t.refresh = function(e) {
      this.init(!0, e);
    }),
    (t.setOption = function(t, e) {
      var i = this;
      i.breakpoint && !e
        ? i._opt.responsive.forEach(function(e) {
            e.breakpoint === i.breakpoint && (e.settings = Object.assign({}, e.settings, t));
          })
        : (i._opt = Object.assign({}, i._opt, t)),
        (i.breakpoint = 0),
        i.settingsBreakpoint();
    }),
    (t.destroy = function() {
      function e(t) {
        t.removeAttribute("style"),
          [].forEach.call(t.classList, function(e) {
            /^glider/.test(e) && t.classList.remove(e);
          });
      }
      var t = this,
        i = t.ele.cloneNode(!0);
      (i.children[0].outerHTML = i.children[0].innerHTML),
        e(i),
        [].forEach.call(i.getElementsByTagName("*"), e),
        t.ele.parentNode.replaceChild(i, t.ele),
        t.event(n, "remove", { resize: t.resize }),
        t.emit("destroy");
    }),
    (t.emit = function(e, t) {
      var i = new n.CustomEvent("glider-" + e, { bubbles: !this.opt.eventPropagate, detail: t });
      this.ele.dispatchEvent(i);
    }),
    (t.event = function(e, t, i) {
      var o = e[t + "EventListener"].bind(e);
      Object.keys(i).forEach(function(e) {
        o(e, i[e]);
      });
    }),
    e
  );
});

var head = document.getElementsByTagName("head")[0];
var link = document.createElement("style");
link.innerHTML =
  ".glider,.glider-contain{margin:0 auto;position:relative}.glider,.glider-track{transform:translateZ(0)}.glider-dot,.glider-next,.glider-prev{border:0;padding:0;user-select:none;outline:0}.glider-contain{width:100%}.glider{overflow-y:hidden;-webkit-overflow-scrolling:touch;-ms-overflow-style:none}.glider-track{width:100%;margin:0;padding:0;display:flex;z-index:1}.glider.draggable{user-select:none;cursor:-webkit-grab;cursor:grab}.glider.draggable .glider-slide img{user-select:none;pointer-events:none}.glider.drag{cursor:-webkit-grabbing;cursor:grabbing}.glider-slide{user-select:none;justify-content:center;align-content:center;width:100%}.glider-slide img{max-width:100%}.glider::-webkit-scrollbar{opacity:0;height:0}.glider-next,.glider-prev{position:static;background:0 0;z-index:2;font-size:40px;text-decoration:none;left:-23px;top:30%;cursor:pointer;color:#666;opacity:1;line-height:1;transition:opacity .5s cubic-bezier(.17,.67,.83,.67),color .5s cubic-bezier(.17,.67,.83,.67)}.glider-next:focus,.glider-next:hover,.glider-prev:focus,.glider-prev:hover{color:#ccc}.glider-next{right:-23px;left:auto}.glider-next.disabled,.glider-prev.disabled{opacity:.25;color:#666;cursor:default}.glider-hide{opacity:0}.glider-dots{user-select:none;display:flex;flex-wrap:wrap;justify-content:center;margin:0 auto;padding:0}.glider-dot{display:block;cursor:pointer;color:#ccc;border-radius:999px;background:#ccc;width:12px;height:12px;margin:7px}.glider-dot:focus,.glider-dot:hover{background:#ddd}.glider-dot.active{background:#a89cc8}@media(max-width:36em){.glider::-webkit-scrollbar{opacity:1;-webkit-appearance:none;width:7px;height:3px}.glider::-webkit-scrollbar-thumb{opacity:1;border-radius:99px;background-color:rgba(156,156,156,.25);-webkit-box-shadow:0 0 1px rgba(255,255,255,.25);box-shadow:0 0 1px rgba(255,255,255,.25)}}";
head.appendChild(link);
