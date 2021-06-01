"use strict";
const clientServerCommon = {
  scoreStripPreParser: (fullWidgetData, { toBeFetchedFrom, valueReplacerObj, selectedLang }) => {
    fullWidgetData.sportsArray = toBeFetchedFrom.filter.filter(sportInfo => sportInfo.show_sport);
    fullWidgetData.sportInfo = toBeFetchedFrom.filter.find(sportInfo => sportInfo.is_default);
    fullWidgetData.sport = fullWidgetData.sportInfo.id;
    fullWidgetData.team = toBeFetchedFrom.team;
    fullWidgetData.tournament = toBeFetchedFrom.tournament;
    fullWidgetData.leagueInfo = fullWidgetData.sportInfo.has_leagues
      ? fullWidgetData.sportInfo.leagues.find(leagueInfo => leagueInfo.is_default)
      : {};
    fullWidgetData.partnerLogo = fullWidgetData.leagueInfo.partner_logo
      ? fullWidgetData.leagueInfo.partner_logo
      : fullWidgetData.sportInfo.partner_logo
      ? fullWidgetData.sportInfo.partner_logo
      : "";
    fullWidgetData.oddsLink = fullWidgetData.leagueInfo.odds_link
      ? fullWidgetData.leagueInfo.odds_link
      : fullWidgetData.sportInfo.odds_link
      ? fullWidgetData.sportInfo.odds_link
      : "";

    fullWidgetData.league = fullWidgetData.leagueInfo && fullWidgetData.leagueInfo.league_code ? fullWidgetData.leagueInfo.league_code : "0";
    if (fullWidgetData.leagueInfo && fullWidgetData.leagueInfo.tour_id) fullWidgetData.tournament = fullWidgetData.leagueInfo.tour_id;
    fullWidgetData.selectedSportName = fullWidgetData.sportInfo.name;
    fullWidgetData.selectedLeagueName = fullWidgetData.leagueInfo ? fullWidgetData.leagueInfo.name : "";
    fullWidgetData.hasLeagueFilter = toBeFetchedFrom.has_filter;

    valueReplacerObj.SPORT = fullWidgetData.sport || "1";
    valueReplacerObj.LEAGUE = fullWidgetData.league || "0";
    valueReplacerObj.LANG = selectedLang || "en";
    if (fullWidgetData.team) {
      valueReplacerObj.FEEDTYPE = "teamcode";
      valueReplacerObj.FEEDVALUE = fullWidgetData.team;
    } else if (fullWidgetData.tournament) {
      valueReplacerObj.FEEDTYPE = "tournament";
      valueReplacerObj.FEEDVALUE = fullWidgetData.tournament;
    } else {
      valueReplacerObj.FEEDTYPE = "gamestate";
      valueReplacerObj.FEEDVALUE = "4";
    }
  },
  scoreStripDataParser: ({ matches, marketDataArray, utils, winstonLogger, customNames }) => {
    let liveMatches = [];
    let upcomingMatches = [];
    let recentMatches = [];

    let marketDataObj = {};
    marketDataArray.forEach(marketData => {
      marketDataObj[marketData.game_id] = marketData;
    });

    matches.forEach(matchData => {
      if (marketDataObj[matchData.game_id]) {
        matchData.marketInfo = marketDataObj[matchData.game_id].market;
      }
      matchData.participants[0].customName = utils.getTeamCustomName({
        winstonLogger,
        participantNode: matchData.participants[0],
        customNames,
        sportName: matchData.sport,
        type: "full"
      });
      matchData.participants[1].customName = utils.getTeamCustomName({
        winstonLogger,
        participantNode: matchData.participants[1],
        customNames,
        sportName: matchData.sport,
        type: "full"
      });

      matchData.participants[0].customShortName = utils.getTeamCustomName({
        winstonLogger,
        participantNode: matchData.participants[0],
        customNames,
        sportName: matchData.sport,
        type: "short"
      });
      matchData.participants[1].customShortName = utils.getTeamCustomName({
        winstonLogger,
        participantNode: matchData.participants[1],
        customNames,
        sportName: matchData.sport,
        type: "short"
      });

      matchData.customTourName =
        utils.getTourCustomName({ winstonLogger, tourId: matchData.tour_id, customNames, sportName: matchData.sport }) || matchData.tour_name;

      matchData.customStatus = utils.getCustomStatus({
        winstonLogger,
        matchNode: matchData,
        customNames
      });
      if (matchData.event_state === "L") {
        liveMatches.push(matchData);
      } else if (matchData.event_state === "U") {
        upcomingMatches.push(matchData);
      } else {
        recentMatches.push(matchData);
      }
      // widgetParsedData.matches.push(matchData);
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

    return liveMatches.concat(upcomingMatches, recentMatches.reverse());
  },
  kabaddiPBPDataParser: ({ matcheData, marketDataArray, utils, customNames, isServer, isMobile }) => {
    return processPBP(matcheData);

    function processPBP(matchData) {
      //var matchData = vueInstance.widgetData.gameData;
      var minutesArr = [];

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
      var playersObj = players.reduce(function(obj, cur) {
        obj[cur.id] = cur;
        return obj;
      }, {});
      var isResultAdded = false,
        isTossAdded = false;
      pbp.forEach(function(p, idx) {
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

      return clonePbp;
    }
  },
  cricketScorecardDataParser: ({ matcheData, marketDataArray, utils, winstonLogger, customNames, isServer, isMobile }) => {
    if (matcheData.Matchdetail && matcheData.Matchdetail.Series && matcheData.Matchdetail.Series.Id && matcheData.Matchdetail.Series.Name) {
      matcheData.Matchdetail.Series.Name =
        utils.getTourCustomName({ winstonLogger: false, tourId: matcheData.Matchdetail.Series.Id, customNames, sportName: "cricket" }) ||
        matcheData.Matchdetail.Series.Name;
    }
    return parseData(matcheData);
    function parseData(data) {
      /** handling super over **/
      if (data.Superover && data.Superover.Innings && data.Superover.Innings.length) {
        /** old structure **/
        for (var i = 0; i < data.Superover.Innings.length; i++) {
          if (i == 0) {
            data.Superover.Innings[i].Number = "Third";
            data.Innings[2] = data.Superover.Innings[i];
            data.Innings[2].oldSuperOver = true;
          } else if (i == 1) {
            data.Superover.Innings[i].Number = "Fourth";
            data.Innings[3] = data.Superover.Innings[i];
            data.Innings[3].oldSuperOver = true;
          }
        }
        data.oldSuperOver = true;
      } else if (data.Superovers && data.Superovers.length) {
        /** new structure **/
        for (var s = 0; s < data.Superovers.length; s++) {
          var soData = data.Superovers[s];
          for (var i = 0; i < soData.Innings.length; i++) {
            soData.Innings[i].isso = true;
            soData.Innings[i].SuperoverNumber = s + 1;
            data.Innings.push(soData.Innings[i]);
          }
        }
      }

      // update customNames
      for (var x in data.Teams) {
        if (!data.Teams[x].actual_Name_Full) data.Teams[x].actual_Name_Full = data.Teams[x].Name_Full;
        if (!data.Teams[x].actual_Name_Short) data.Teams[x].actual_Name_Short = data.Teams[x].Name_Short;
        var obj = {};
        obj.id = x;
        obj.name = data.Teams[x].Name_Full;
        obj.short_name = data.Teams[x].Name_Short;
        data.Teams[x].Name_Full = utils.getTeamCustomName({ winstonLogger, participantNode: obj, customNames, sportName: "cricket", type: "full" });
        data.Teams[x].Name_Short = utils.getTeamCustomName({ winstonLogger, participantNode: obj, customNames, sportName: "cricket", type: "short" });
      }

      /** **** toss information ***************** **/

      var mdet = data.Matchdetail;

      var toss = "";
      var tName = mdet.Series ? mdet.Series.Tour_Name : "";
      var teamA = data.Teams[mdet.Team_Home].Name_Short;
      var teamB = data.Teams[mdet.Team_Away].Name_Short;
      var score = "",
        activeTab = "summary";

      if (mdet.Tosswonby) {
        var tosswon = mdet.Tosswonby;
        toss = data.Teams[tosswon].Name_Full + " elected to ";

        if (data.Innings) {
          if (tosswon == data.Innings[0].Battingteam) {
            toss += "bat";
          } else if (tosswon != data.Innings[0].Battingteam) {
            toss += "field";
          }
        } else if (mdet.Toss_elected_to) {
          toss += mdet.Toss_elected_to;
        }

        data.Matchdetail.toss = toss;
      }

      data.Matchdetail.sub_status = mdet.Equation ? mdet.Equation : toss;

      if (!data.Matchdetail.sub_status && mdet.Prematch && mdet.Prematch != mdet.Status) {
        data.Matchdetail.sub_status = mdet.Prematch;
      }
      if (data.Matchdetail.sub_status) {
        let t1 = data.Teams[mdet.Team_Home];
        let t2 = data.Teams[mdet.Team_Away];

        data.Matchdetail.sub_status = data.Matchdetail.sub_status
          .replace(t1.actual_Name_Full, t1.Name_Full)
          .replace(t1.actual_Name_Short, t1.Name_Short)
          .replace(t2.actual_Name_Full, t2.Name_Full)
          .replace(t2.actual_Name_Short, t2.Name_Short);

        if (data.Matchdetail.sub_status.indexOf("Super Over") != -1) {
          data.Matchdetail.sub_status = data.Matchdetail.sub_status
            .replace(t1.actual_Name_Full, t1.Name_Full)
            .replace(t1.actual_Name_Short, t1.Name_Short)
            .replace(t2.actual_Name_Full, t2.Name_Full)
            .replace(t2.actual_Name_Short, t2.Name_Short);
        }
      }
      // adding space between umpires name
      var umpires = mdet.Officials && mdet.Officials.Umpires ? mdet.Officials.Umpires : "-";
      if (umpires && umpires != "" && umpires.indexOf(",") != -1) {
        var _umpires = umpires.split(",");
        var _umpiresConcat = "";
        for (var u = 0; u < _umpires.length; u++) {
          _umpiresConcat += _umpires[u];
          if (u < _umpires.length - 1) {
            _umpiresConcat += ", ";
          }
        }
        umpires = _umpiresConcat;
        data.Matchdetail.Officials.Umpires = umpires;
      }

      /***** calculating top players ****/
      if (data.Innings) {
        var allInns = data.Innings;
        for (var i = 0; i < allInns.length; i++) {
          var inn = allInns[i],
            preStr = "",
            battingTeam = data.Teams[inn.Battingteam],
            bowlingTeam = "";
          /** get bowling team **/
          for (var team in data.Teams) {
            if (team != inn.Battingteam) {
              data.Teams[team].id = team;
              bowlingTeam = data.Teams[team];
              /** get bowling team squads for first innings **/
              data.squads = [];
              if (allInns.length == 1) {
                for (var p in bowlingTeam.Players) {
                  var pid = p;
                  bowlingTeam.Players[p].team_id = bowlingTeam.id;
                  //bowlingTeam.Players[p].player_id=pid;
                }
                data.squads.push(bowlingTeam);
              }
              break;
            }
          }

          // bowlingTeam adding in old file
          if (!data.Innings[i].Bowlingteam && bowlingTeam) {
            data.Innings[i].Bowlingteam = bowlingTeam.id;
          }

          score =
            battingTeam.Name_Short +
            " - " +
            data.Innings[data.Innings.length - 1].Total +
            "/" +
            data.Innings[data.Innings.length - 1].Wickets +
            " | ";

          /** calculate extras run **/
          data.Innings[i].extras = parseInt(inn.Byes) + parseInt(inn.Legbyes) + parseInt(inn.Noballs) + parseInt(inn.Wides) + parseInt(inn.Penalty);

          /** set inning Title **/
          data.Innings[i].Name_Full = battingTeam.Name_Full;
          data.Innings[i].Name_Short = battingTeam.Name_Short;

          var mdet = data.Matchdetail;
          //setting super over tab name
          if (data.Superover && i > 1) {
            data.Innings[i].graphsRequired = false;
            data.Innings[i].Name_Full = battingTeam.Name_Full + " Super Over";
            data.Innings[i].Name_Short = battingTeam.Name_Short + " Super Over";
          } else if (data.Superovers && i > 1) {
            var soNumber = data.Innings[i].SuperoverNumber ? data.Innings[i].SuperoverNumber : "";
            data.Innings[i].graphsRequired = false;
            data.Innings[i].Name_Full = battingTeam.Name_Full + "(SO-" + soNumber + ")";
            data.Innings[i].Name_Short = battingTeam.Name_Short + "(SO-" + soNumber + ")";
          } else if ((mdet.Match.Coverage_level_id && mdet.Match.Coverage_level_id == "8") || mdet.Match.League == "ipl") {
            data.Innings[i].graphsRequired = true;
          }
          var format = data.Matchdetail.Match.Type;
          if (
            format &&
            (format.toLowerCase() == "test" ||
              format.toLowerCase() == "first-class" ||
              format.toLowerCase() == "youth-test" ||
              format.toLowerCase() == "exhibition-test")
          ) {
            if (i < 2) preStr = " 1st";
            else preStr = " 2nd";
            data.Innings[i].Name_Full += preStr + " innings";
            data.Innings[i].Name_Short += preStr + " inn";
          }
        }

        if (mdet.Result && mdet.Result != "") {
          data.Matchdetail.state = "R";
          data.topBatsmen = getTopBatsmen(data);
          data.topBowlers = getTopBowlers(data);
        } else {
          data.Matchdetail.state = "L";
          data.topBatsmen = getCurrentBatsmen(data);
          data.topBowlers = getCurrentBowlers(data);
        }
        /****** set team score ********/
        data.Teams.scores = setParticipantValues(data);
        /**************/
        if (
          allInns[0] &&
          allInns[0].Overs != "0.0" &&
          ((mdet.Match.Coverage_level_id && mdet.Match.Coverage_level_id == "8") || mdet.Match.League == "ipl")
        ) {
          data.chartsRequired = true;
        }
      } else {
        data.topBatsmen = [];
        data.topBowlers = [];
        data.Matchdetail.state = "U";
        // creating Squads tab
        data.squads = [];
        for (var i in data.Teams) {
          data.Teams[i].id = i;
          for (var p in data.Teams[i].Players) {
            var pid = p;
            data.Teams[i].Players[p].team_id = data.Teams[i].id;
            //data.Teams[i].Players[p].player_id=pid;
          }
          data.squads.push(data.Teams[i]);
        }
        data.chartsRequired = false;
      }

      if (!data.Innings) {
        let sortedPlayers = [];
        let selectedTeam = data.squads[0].id;
        let squadsPlayer = data.Teams[selectedTeam];

        for (var k in squadsPlayer.Players) {
          if (squadsPlayer.Players.hasOwnProperty(k)) {
            sortedPlayers.push(squadsPlayer.Players[k]);
          }
        }
        sortedPlayers.sort(function(a, b) {
          var x = parseInt(a.Matches);
          var y = parseInt(b.Matches);
          return x > y ? -1 : x < y ? 1 : 0;
        });

        data.squadsPlayer = sortedPlayers;
      }

      return data;
    }

    function getCurrentBatsmen(data) {
      var innNo = parseInt(data.Innings.length);
      var batsmen = data.Innings[innNo - 1].Batsmen;
      var battingTeam = data.Innings[innNo - 1].Battingteam;
      var currPlayers = [];
      var _teams = data.Teams[battingTeam];
      batsmen.forEach(batsman => {
        if (batsman.Isbatting) {
          _teams.id = battingTeam;

          var playerObj = getPlayerObj(batsman.Batsman, _teams);

          var value = batsman.Runs || 0;
          value += " (" + (batsman.Balls || 0) + ")";
          var details = {
            runs: batsman.Runs,
            balls: batsman.Balls,
            sixes: batsman.Sixes,
            fours: batsman.Fours,
            Strikerate: batsman.Strikerate
          };
          var obj = {
            playerId: batsman.Batsman,
            Name_Full: playerObj.Name_Full,
            Name_Short: playerObj.Name_Short,
            Name_First: playerObj.Name_First,
            Name_Last: playerObj.Name_Last,
            value: value,
            details: [details],
            type: "batsman"
          };
          if (batsman.Isonstrike) {
            obj.isOnStrike = true;
          }
          currPlayers.push(obj);
        }
      });
      var players = { players: currPlayers };

      return players;
    }

    function getCurrentBowlers(data) {
      var innNo = parseInt(data.Innings.length);
      var bowlers = data.Innings[innNo - 1].Bowlers;
      var Bowlingteam = data.Innings[innNo - 1].Bowlingteam;

      var _teams = data.Teams[Bowlingteam];
      var currentBowlers = [];
      bowlers.forEach(bowler => {
        if (bowler.Isbowlingtandem) {
          var newBowler = {};
          _teams.id = Bowlingteam;

          var playerObj = getPlayerObj(bowler.Bowler, _teams);
          var value = bowler.Wickets || 0;
          value += "/" + (bowler.Runs || 0);
          value += " (" + bowler.Overs + ")";
          var details = {
            runs: bowler.Runs,
            wickets: bowler.Wickets,
            overs: bowler.Overs,
            maidens: bowler.Maidens
          };
          var obj = {
            playerId: bowler.Bowler,
            Name_Full: playerObj.Name_Full,
            Name_Short: playerObj.Name_Short,
            Name_First: playerObj.Name_First,
            Name_Last: playerObj.Name_Last,
            value: value,
            isBowlingNow: false,
            details: [details],
            type: "bowler"
          };
          if (bowler.Isbowlingnow) {
            obj.isBowlingNow = true;
          }
          currentBowlers.push(obj);
        }
      });

      if (currentBowlers.length == 2 && currentBowlers[1].isBowlingNow) {
        var temp = currentBowlers[0];
        currentBowlers[0] = currentBowlers[1];
        currentBowlers[1] = temp;
      }

      var players = { players: currentBowlers };
      return players;
    }

    function getPlayerObj(playerId, _team) {
      var player = {};
      player.Name_First = "";
      player.Name_Last = "";
      player.team = "";
      var players = _team.Players;

      if (players[playerId]) {
        player = players[playerId];
        var playerTeam = { teamId: _team.id, Name_Full: _team.Name_Full, Name_Short: _team.Name_Short };

        if (player.Name_Full.indexOf(" ") != -1) {
          var names = player.Name_Full.split(" ");
          player.Name_First = names[0];
          player.Name_Last = "";
          for (var n = 1; n < names.length; n++) {
            player.Name_Last += names[n] + " ";
          }
        } else {
          player.Name_First = "";
          player.Name_Last = "";
        }

        player.team = playerTeam;
        if (players[playerId].Iscaptain) playerTeam.Iscaptain = true;
        if (players[playerId].Iskeeper) playerTeam.Iskeeper = true;
      }

      return player;
    }

    function sortBowlers(bowlersArr) {
      return bowlersArr.sort(function(a, b) {
        var aRuns = 0,
          bRuns = 0,
          aWickets = 0,
          bWickets = 0,
          aOvs = 0,
          bOvs = 0,
          aInns = a.details,
          bInns = b.details,
          aEco = 0,
          bEco = 0;
        aInns.forEach(function(inn) {
          aRuns += inn.runs ? parseInt(inn.runs) : 0;
          aWickets += inn.wickets ? parseInt(inn.wickets) : 0;
          aOvs += inn.overs ? parseInt(inn.overs) : 0;
        });
        bInns.forEach(function(inn) {
          bRuns += inn.runs ? parseInt(inn.runs) : 0;
          bWickets += inn.wickets ? parseInt(inn.wickets) : 0;
          bOvs += inn.overs ? parseInt(inn.overs) : 0;
        });
        if (aOvs > 0) {
          aEco = aRuns / aOvs;
        }
        if (bOvs > 0) {
          bEco = bRuns / bOvs;
        }
        if (aWickets < bWickets) return 1;
        if (aWickets > bWickets) return -1;
        if (aWickets === bWickets) {
          if (aEco < bEco) return -1;
          if (aEco > bEco) return 1;
          if (aEco === bEco) {
            if (aOvs < bOvs) return 1;
            if (aOvs > bOvs) return -1;
            return 0;
          }
          return 0;
        }
        return 0;
      });
    }

    function sortBatsmen(batsmenArr) {
      return batsmenArr.sort(function(a, b) {
        var aRuns = 0,
          bRuns = 0,
          aBalls = 0,
          bBalls = 0,
          aInns = a.details,
          bInns = b.details;
        aInns.forEach(function(inn) {
          aRuns += inn.runs ? parseInt(inn.runs) : 0;
          aBalls += inn.balls ? parseInt(inn.balls) : 0;
        });
        bInns.forEach(function(inn) {
          bRuns += inn.runs ? parseInt(inn.runs) : 0;
          bBalls += inn.balls ? parseInt(inn.balls) : 0;
        });
        if (aRuns < bRuns) return 1;
        if (aRuns > bRuns) return -1;
        if (aRuns == bRuns) {
          if (aBalls < bBalls) return -1;
          if (aBalls > bBalls) return 1;
          return 0;
        }
        return 0;
      });
    }

    function getTopBatsmen(data) {
      let allBatsmen = {};
      let batsmenArray = [];
      if (data.Innings && data.Innings.length) {
        data.Innings.forEach(inningsNode => {
          if (inningsNode.Batsmen && inningsNode.Batsmen.length) {
            inningsNode.Batsmen.forEach(batsmanNode => {
              if (!batsmanNode.Batsman) return;
              let details = {
                runs: batsmanNode.Runs ? parseInt(batsmanNode.Runs) : 0,
                balls: batsmanNode.Balls ? parseInt(batsmanNode.Balls) : 0,
                Strikerate: batsmanNode.Strikerate ? parseInt(batsmanNode.Strikerate) : 0
              };
              if (!batsmenArray.includes(batsmanNode.Batsman)) {
                batsmenArray.push(batsmanNode.Batsman);
                allBatsmen[batsmanNode.Batsman] = batsmanNode;

                allBatsmen[batsmanNode.Batsman].Name_Full = data.Teams[data.Matchdetail.Team_Home].Players[batsmanNode.Batsman]
                  ? data.Teams[data.Matchdetail.Team_Home].Players[batsmanNode.Batsman].Name_Full
                  : data.Teams[data.Matchdetail.Team_Away].Players[batsmanNode.Batsman].Name_Full;

                allBatsmen[batsmanNode.Batsman].details = [];
              }
              allBatsmen[batsmanNode.Batsman].details.push(details);
            });
          }
        });
      }
      let allBatsmenArray = Object.keys(allBatsmen).map(batsmanId => allBatsmen[batsmanId]);
      let sortedBatsmanList = sortBatsmen(allBatsmenArray);
      if (sortedBatsmanList.length > 2) {
        sortedBatsmanList.length = 2;
      }
      const players = { players: sortedBatsmanList };
      return players;
    }

    function getTopBowlers(data) {
      let allBowlers = [];
      let bowlersArray = [];
      if (data.Innings && data.Innings.length) {
        data.Innings.forEach(inningsNode => {
          if (inningsNode.Bowlers && inningsNode.Bowlers.length) {
            inningsNode.Bowlers.forEach(bowlerNode => {
              if (!bowlerNode.Bowler) return;
              let details = {
                runs: bowlerNode.Runs,
                wickets: bowlerNode.Wickets,
                overs: bowlerNode.Overs,
                maidens: bowlerNode.Maidens
              };
              if (!bowlersArray.includes(bowlerNode.Bowler)) {
                bowlersArray.push(bowlerNode.Bowler);
                allBowlers[bowlerNode.Bowler] = bowlerNode;
                allBowlers[bowlerNode.Bowler].Name_Full = data.Teams[data.Matchdetail.Team_Home].Players[bowlerNode.Bowler]
                  ? data.Teams[data.Matchdetail.Team_Home].Players[bowlerNode.Bowler].Name_Full
                  : data.Teams[data.Matchdetail.Team_Away].Players[bowlerNode.Bowler].Name_Full;
                allBowlers[bowlerNode.Bowler].details = [];
              }
              allBowlers[bowlerNode.Bowler].details.push(details);
            });
          }
        });
      }
      let allBowlersArray = Object.keys(allBowlers).map(bowlerId => allBowlers[bowlerId]);
      let sortedBowlerList = sortBowlers(allBowlersArray);
      if (sortedBowlerList.length > 2) {
        sortedBowlerList.length = 2;
      }
      const players = { players: sortedBowlerList };
      return players;
    }

    function setParticipantValues(data) {
      var scoreValues = {};
      if (!data.Innings || data.Innings.length == 0) {
        return;
      }

      var inns = data.Innings;
      if (inns.length > 2 && inns[1].Battingteam == inns[2].Battingteam && !data.Matchdetail.isso) {
        inns[2].isFollowOn = true;
      }
      for (var ix = 0, innLen = inns.length; ix < innLen; ix++) {
        var inn = inns[ix];
        var batTeamId = inn.Battingteam;
        if (!scoreValues[batTeamId]) {
          scoreValues[batTeamId] = scoreValues[batTeamId] || {};
          scoreValues[batTeamId]["scores"] = scoreValues[batTeamId]["scores"] || [];
          scoreValues[batTeamId].scores.push(fnGetTeamScore(inn));
        } else {
          scoreValues[batTeamId].scores.push(fnGetTeamScore(inn));
        }
      }

      //highlight after result
      if (data.Matchdetail.Result) {
        for (var t in data.Teams) {
          if (t == data.Matchdetail.Winningteam) {
            if (scoreValues[data.Matchdetail.Winningteam]) {
              scoreValues[data.Matchdetail.Winningteam].highlight = true;
            }
          }
        }
      } else {
        //now & highlight during live
        if (inns[inns.length - 1].Battingteam == batTeamId) {
          if (scoreValues[inns[inns.length - 1].Battingteam]) scoreValues[inns[inns.length - 1].Battingteam].highlight = true;
        }
      }

      function fnGetTeamScore(innData) {
        var innScore = innData.Total || "0";
        var wickets = innData.Wickets || "0";
        var obj = {};

        if (wickets == 10) wickets = "";
        if (wickets != "") innScore += "/" + wickets;

        if (innData.Isdeclared) {
          innScore += " dec";
        } else if (innData.isFollowOn) {
          innScore += " f/o";
        }
        obj.runs = innScore;
        obj.overs = innData.Overs;

        if (innData.Runrate && innData.Runrate != 0 && inns[inns.length - 1].Number == innData.Number) {
          obj.Runrate = innData.Runrate;
        }
        return obj;
      }

      return scoreValues;
    }
  },
  footballScorecardDataParser: ({ matcheData, marketDataArray, utils, isServer, isMobile }) => {
    let widgetData = matcheData;
    widgetData.leaguecode = "epl";

    widgetData.lineupTab = "line-ups";
    widgetData.eventTab = "stats";
    widgetData.pbpTab = "play-by-play";

    widgetData.defaultTab = matcheData.defaultTab || widgetData.lineupTab;
    widgetData.gamecode = "34385";

    widgetData.limitEvents = 10;

    widgetData.halfTime = 45;
    widgetData.fullTime = 90;
    widgetData.lEvents = [12, 18, 31, 13, 9, 17, 16];
    widgetData.gEvents = [9, 16, 17];

    widgetData.pbpAllEvents = [1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 13, 16, 17, 19, 18, 20, 21, 22, 31];
    widgetData.pbpKeyEvents = [1, 11, 12, 18, 31, 13, 9, 17, 16, 20, 21, 22];

    widgetData.timelineHeight = 0;
    widgetData.isTimeline = false;

    widgetData.pbpTabName = "all";

    widgetData.selectedTeam = 0;

    widgetData.playerModal = false;

    function getPlayerGoals(goalEvents) {
      let uniquePlayerIds = [];
      let playerGoals = [];

      goalEvents.forEach(goal => {
        if (uniquePlayerIds.indexOf(goal.offensive_player.player_id) === -1) {
          uniquePlayerIds.push(goal.offensive_player.player_id);
        }
      });

      uniquePlayerIds.forEach((id, index) => {
        let obj = { player_id: id, goals: [] };
        playerGoals.push(obj);

        goalEvents.forEach(goal => {
          if (id === goal.offensive_player.player_id) {
            playerGoals[index]["short_name"] = goal.offensive_player.player_name;
            playerGoals[index]["display_name"] = goal.offensive_player.display_name;
            playerGoals[index]["team_id"] = goal.team_id;
            playerGoals[index]["goals"].push(goal);
          }
        });
      });

      return playerGoals;
    }

    function printLineUps() {
      let teams = widgetData.teams;
      let teamLength = teams.length;

      widgetData.lineupEvents = widgetData.events.filter(e => widgetData.lEvents.indexOf(e.event_id) > -1);

      for (let i = 0; i < teamLength; i++) {
        let team = [];

        teams[i].players.forEach(player => {
          if (player.hasOwnProperty(player.id)) {
            player[player.id] = [];
          }

          if (player.is_started) team.push(player);

          if (player.position_id == 4) player.order_id = 1;
          else if (player.position_id == 3) player.order_id = 3;
          else if (player.position_id == 2) player.order_id = 4;
          else if (player.position_id == 1) player.order_id = 2;

          widgetData.lineupEvents.forEach(event => {
            if (
              (event.offensive_player && event.offensive_player.player_id && player.id == event.offensive_player.player_id) ||
              (event.substitution && event.substitution.player_out && player.id == event.substitution.player_out.player_id) ||
              (event.substitution && event.substitution.player_in && player.id == event.substitution.player_in.player_id)
            ) {
              if (!player.hasOwnProperty(player.id)) {
                player[player.id] = [];
              }
              player[player.id].push(event);
            }
          });
        });

        teams[i].players.sort(function(a, b) {
          return a.order_id - b.order_id;
        });

        team.sort(function(a, b) {
          return parseInt(a.formation) - parseInt(b.formation);
        });

        let rowColumn = [];
        let cutFrom = 1;
        let cutTo = 1;

        let teamRow = [4, 4, 2]; // default formation
        if (teams[i].formation && teams[i].formation != "0") {
          teamRow = teams[i].formation.split("-");
        }

        teamRow.forEach(item => {
          cutTo = cutTo + parseInt(item);
          let partArr = team.slice(cutFrom, cutTo);
          cutFrom = cutFrom + parseInt(item);
          rowColumn.push(partArr);
        });

        if (i < 1) {
          widgetData.goalKeeperA = team.shift();
          widgetData.formationA = teams[i].formation;
          widgetData.aTeamPlayers = rowColumn;
          widgetData.rowCountA = teamRow.length;
        } else {
          widgetData.goalKeeperB = team.shift();
          widgetData.formationB = teams[i].formation;
          widgetData.bTeamPlayers = rowColumn;
          widgetData.rowCountB = teamRow.length;
        }

        widgetData.selectedLineUps();
      }
    }

    function selectedLineUps() {
      if (widgetData.selectedTeam === 1) {
        widgetData.selectedFormation = widgetData.formationB;
        widgetData.selectedGoalKeeper = widgetData.goalKeeperB;
        widgetData.selectedTeamPlayers = widgetData.bTeamPlayers;
      } else {
        widgetData.selectedFormation = widgetData.formationA;
        widgetData.selectedGoalKeeper = widgetData.goalKeeperA;
        widgetData.selectedTeamPlayers = widgetData.aTeamPlayers;
      }
    }

    function printPlayByPlay() {
      let events = [];
      if (widgetData.pbpTabName === "all") {
        events = widgetData.events.filter(e => widgetData.pbpAllEvents.indexOf(e.event_id) > -1);
      } else {
        events = widgetData.events.filter(e => widgetData.pbpKeyEvents.indexOf(e.event_id) > -1);
      }
      widgetData.keyEvents = events.reverse();
    }

    function printTimeline() {
      let aTeamEvents = [];
      let bTeamEvents = [];
      let abTeamEvents = [];
      widgetData.events.forEach(e => {
        if (widgetData.lEvents.indexOf(e.event_id) > -1) {
          abTeamEvents.push(e);
          if (e.team_id == widgetData.teams[0].id) {
            let lastEle = aTeamEvents[aTeamEvents.length - 1];
            if (lastEle && lastEle[0].time.minutes === e.time.minutes) {
              lastEle.push(e);
            } else {
              aTeamEvents.push([e]);
            }
          }

          if (e.team_id == widgetData.teams[1].id) {
            let lastEle = bTeamEvents[bTeamEvents.length - 1];
            if (lastEle && lastEle[0].time.minutes === e.time.minutes) {
              lastEle.push(e);
            } else {
              bTeamEvents.push([e]);
            }
          }
        }
      });

      widgetData.aTeamEvents = aTeamEvents;
      widgetData.bTeamEvents = bTeamEvents;
      widgetData.abTeamEvents = abTeamEvents;
      let clock = widgetData.matchDetails.clock.minutes;

      if (clock > 90) {
        widgetData.fullTime = 120;
      }

      if (widgetData.matchDetails.clock.seconds > 0) {
        clock += 1;
      }

      widgetData.timelineProgress = (clock / widgetData.fullTime) * 100;
    }

    function printMastHead() {
      widgetData.matchDetails = widgetData.match_detail;
      //widgetData.teams = widgetData.teams;

      if (widgetData.matchDetails && widgetData.matchDetails.officials && widgetData.matchDetails.officials.length) {
        widgetData.matchDetails.officials.forEach(off => {
          if (off.official_type_id == "1") widgetData.referee = off.name;
        });
      }

      widgetData.goalEvents = widgetData.events.filter(e => widgetData.gEvents.indexOf(e.event_id) > -1);
      widgetData.playerGoals = getPlayerGoals(widgetData.goalEvents);

      widgetData.eventStats = [
        {
          parentKey: "events",
          key: "goals",
          displayName: "GOALS"
        },
        {
          parentKey: "events",
          key: "offsides",
          displayName: "OFFSIDES"
        },
        {
          parentKey: "events",
          key: "shots_on_target",
          displayName: "SHOTS ON TARGET"
        },
        {
          parentKey: "events",
          key: "shots_off_target",
          displayName: "SHOTS OFF TARGET"
        },
        {
          parentKey: "touches",
          key: "total_passes",
          displayName: "NUMBER OF PASSES"
        },
        {
          parentKey: "touches",
          key: "total",
          displayName: "TOUCHES"
        },
        {
          parentKey: "events",
          key: "fouls_committed",
          displayName: "FOULS"
        },
        {
          parentKey: "touches",
          key: "interceptions",
          displayName: "INTERCEPTIONS"
        },
        {
          parentKey: "events",
          key: "crosses",
          displayName: "CROSSES"
        },
        {
          parentKey: "events",
          key: "corner_kicks",
          displayName: "CORNERS"
        },
        {
          parentKey: "events",
          key: "red_cards",
          displayName: "RED CARDS"
        },
        {
          parentKey: "events",
          key: "yellow_cards",
          displayName: "YELLOW CARDS"
        }
      ];
    }

    widgetData.printMastHead = printMastHead;
    widgetData.printLineups = printLineUps;
    widgetData.printPlayByPlay = printPlayByPlay;
    widgetData.printTimeline = printTimeline;
    widgetData.selectedLineUps = selectedLineUps;

    printMastHead();
    printTimeline();

    if (widgetData.defaultTab === widgetData.lineupTab) {
      printLineUps();
    } else if (widgetData.defaultTab === widgetData.pbpTab) {
      printPlayByPlay();
    }

    return widgetData;
  },
  fixturesPagePreParser: (inputData, widgetConfig, fullConfig) => {
    let respObj = {
      selectedSportId: 1,
      sportsArray: [],
      showLeaguesFilter: false,
      showExtraFilter: false,
      selectedLeague: {},
      selectedLeagueCode: "",
      leaguesArray: [],
      selectedMonthObj: {},
      selectedTeamId: 0,
      selectedTeamName: "",
      selectedTournamentId: 0,
      selectedTournamentName: "",
      teamsArray: [],
      tournamentsArray: [],
      monthsArray: [],
      currentTabObj: {},
      hasTabs: false,
      tabs: [],
      matches: [],
      upcomingMatches: [],
      recentMatches: [],
      filterButtonRequired: true,
      extraFilter: [],
      showLeaguesDD: false,
      showMonthsDD: false,
      showYearsDD: false,
      showMonthsNewDD: false,
      showTeamsDD: false,
      showTournamentsDD: false,
      lockMonthsDD: false,
      showHiddenFilters: false,
      adsAfter: 4,
      showMonthsFilter: false,
      showTeamFilter: false,
      showTournamentFilter: false,
      feedType: "daterange",
      feedValue: "4",
      seriesId: 0,
      preApis: {},
      preFetchedData: {},
      oddsLink: "",
      partnerLogo: "",
      minMatchYear: "2018"
    };

    const selectedSport = inputData.data.find(sportData => sportData.is_default);
    respObj.selectedSportId = selectedSport.id;
    respObj.oddsLink = selectedSport.odds_link ? selectedSport.odds_link : "";
    respObj.partnerLogo = selectedSport.partner_logo ? selectedSport.partner_logo : "";
    respObj.sportsArray = inputData.data.filter(sportInfo => {
      if (sportInfo.has_leagues && sportInfo.id === respObj.selectedSportId) {
        respObj.leaguesArray = sportInfo.leagues;
        respObj.selectedLeague = sportInfo.leagues.find(leagueInfo => leagueInfo.is_default);
        respObj.selectedLeagueCode = respObj.selectedLeague && respObj.selectedLeague.league_code ? respObj.selectedLeague.league_code : "0";
        respObj.seriesId = respObj.selectedLeague ? respObj.selectedLeague.series_id : "";
        respObj.selectedTournamentId = respObj.selectedLeague && respObj.selectedLeague.tour_id;
        respObj.selectedTournamentName = respObj.selectedTournamentId ? respObj.selectedLeague.name : "";
      }
      if (sportInfo.show_sport) {
        return true;
      } else {
        return false;
      }
    });
    respObj.showLeaguesFilter = inputData.has_filter;
    respObj.showExtraFilter = inputData.has_extra_filter;
    respObj.selectedTeamId = inputData.teamId;
    respObj.selectedTeamName = inputData.teamName ? inputData.teamName.replace(/ /g, "-") : "";
    respObj.selectedTournamentId = respObj.selectedTournamentId || inputData.tournamentId;
    respObj.selectedTournamentName = respObj.selectedTournamentName
      ? respObj.selectedTournamentName
      : inputData.tournamentName
      ? inputData.tournamentName.replace(/ /g, "-")
      : "";
    respObj.hasTabs = inputData.has_tabs;
    respObj.currentTabObj = inputData.tabs_data.find(tabData => tabData.is_default);
    respObj.tabs = inputData.tabs_data;
    respObj.adsAfter = inputData.has_ads && inputData.show_ads_after ? inputData.show_ads_after : 1000;
    respObj.extraFilter = inputData.extra_filter;

    respObj.extraFilter.forEach(extraFilterData => {
      if (extraFilterData.name === "Month") {
        respObj.showMonthsFilter = true;
      } else if (extraFilterData.name === "Teams") {
        respObj.showTeamFilter = true;
      } else if (extraFilterData.name === "Tournaments") {
        respObj.showTournamentFilter = true;
      }
    });

    if (respObj.selectedTeamId) {
      respObj.feedType = "teamcode";
      respObj.feedValue = respObj.selectedTeamId;
    } else if (respObj.selectedTournamentId) {
      respObj.feedType = "tournament";
      respObj.feedValue = respObj.selectedTournamentId;
    } else {
      respObj.preApis.dateList = widgetConfig.apis.dateList;
    }

    // respObj.preApis.teamTourList = respObj.seriesId
    //   ? widgetConfig.teamTourList[respObj.selectedSportId.toString()]
    //   : respObj.selectedSportId === 1
    //   ? widgetConfig.apis.teamTourList
    //   : "";

    respObj.preApis.teamTourList = respObj.seriesId
      ? widgetConfig.teamTourListSeriesBased[respObj.selectedSportId.toString()]
      : widgetConfig.teamTourList[respObj.selectedSportId.toString()];

    if (!respObj.preApis.teamTourList) delete respObj.preApis.teamTourList;

    // if (!respObj.preApis.teamTourList && respObj.selectedSportId === 1) {
    //   respObj.preApis.teamTourList = widgetConfig.apis.teamTourList;
    // }

    if (
      (respObj.selectedSportId === 1 &&
        respObj.selectedLeagueCode !== "0" &&
        respObj.selectedLeagueCode !== "icc" &&
        respObj.selectedLeagueCode !== "virtual_cricket" &&
        respObj.selectedLeagueCode !== "european_cricket") ||
      respObj.selectedSportId === 2 ||
      respObj.selectedSportId === 3
    ) {
      respObj.showTournamentFilter = false;
    }

    if (fullConfig && fullConfig.sportYearMapper && fullConfig.sportYearMapper[respObj.selectedSportId]) {
      respObj.minMatchYear = fullConfig.sportYearMapper[respObj.selectedSportId];
    }

    return respObj;
  },
  fixturesPageDataParser: (inputData, { customNames, utils, winstonLogger, extraClass, isClient }) => {
    let resp = {
      configData: inputData.widgetParsedData,
      serverData: JSON.stringify(inputData.dataToPass),
      matches: [],
      showWidgetTitle: inputData.dataToPass.show_widget_title,
      widgetTitleTag: inputData.dataToPass.widget_title_tag,
      extraClass,
      displayTitle: inputData.title
    };
    let dateList = [];
    let liveMatches = [];
    let recentMatches = [];
    let upcomingMatches = [];
    inputData.widgetData.apis.multiSport.matches = inputData.widgetData.apis.multiSport.matches.filter(matchData => {
      let matchYear = +matchData.start_date.split("-")[0];
      return matchYear >= +inputData.widgetParsedData.minMatchYear;
      // return matchYear > 2018;
    });
    resp.allMatches = inputData.widgetData.apis.multiSport.matches;
    inputData.widgetData.apis.multiSport.matches.forEach((matchData, i) => {
      matchData.participants[0].customName =
        utils.getTeamCustomName({ winstonLogger, id: matchData.participants[0].id, customNames, sportName: matchData.sport, type: "full" }) ||
        matchData.participants[0].name;
      matchData.participants[1].customName =
        utils.getTeamCustomName({ winstonLogger, id: matchData.participants[1].id, customNames, sportName: matchData.sport, type: "full" }) ||
        matchData.participants[1].name;

      matchData.participants[0].customShortName =
        utils.getTeamCustomName({ winstonLogger, id: matchData.participants[0].id, customNames, sportName: matchData.sport, type: "short" }) ||
        matchData.participants[0].short_name;
      matchData.participants[1].customShortName =
        utils.getTeamCustomName({ winstonLogger, id: matchData.participants[1].id, customNames, sportName: matchData.sport, type: "short" }) ||
        matchData.participants[1].short_name;

      matchData.customTourName =
        utils.getTourCustomName({ winstonLogger, tourId: matchData.tour_id, customNames, sportName: matchData.sport }) || matchData.tour_name;

      matchData.customStatus = utils.getCustomStatus({
        winstonLogger,
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

      if (inputData.widgetParsedData.selectedTeamId) {
        let tourObj = {
          tour_id: matchData.tour_id,
          tour_name: matchData.tour_name
        };
        inputData.widgetParsedData.tournamentsArray.push(tourObj);
      }

      if (isClient) {
        let matchesWithOdds = window.SIWidget.oddsFeed.matches;
        let marketData = matchesWithOdds.find(matchDataWithOdds => matchDataWithOdds.game_id === matchData.game_id);
        if (marketData) {
          matchData.market = marketData.market;
        }
        if (
          inputData.widgetParsedData.selectedSportId === 1 &&
          (inputData.widgetParsedData.selectedTeamName || inputData.widgetParsedData.selectedTournamentName)
        ) {
          let matchDateData = matchData.end_date.split("T")[0].split("-");
          let date = matchDateData[2] + matchDateData[1] + matchDateData[0];
          dateList.push(date);
        }
      }
    });

    if (dateList.length) {
      inputData.widgetParsedData.monthsArray = utils.monthsList(dateList);
      inputData.widgetParsedData.yearAndMonthObj = utils.getYearMonthObj(inputData.widgetParsedData.monthsArray);
    }

    resp.liveMatches = liveMatches;
    resp.recentMatches = recentMatches;
    resp.upcomingMatches = upcomingMatches;

    if (inputData.widgetParsedData.tournamentsArray && inputData.widgetParsedData.tournamentsArray.length) {
      inputData.widgetParsedData.tournamentsArray = inputData.widgetParsedData.tournamentsArray.filter(
        (tourData, index, self) => index === self.findIndex(t => t.tour_id === tourData.tour_id)
      );
    }

    if (
      inputData.widgetParsedData.selectedSportId === 1 &&
      inputData.widgetParsedData.preFetchedData.teamTourList &&
      (!inputData.widgetParsedData.preFetchedData.teamTourList || !inputData.widgetParsedData.preFetchedData.teamTourList.standings)
    ) {
      let teamIdArray = [];
      inputData.widgetParsedData.tournamentsArray = [];
      inputData.widgetParsedData.teamsArray = [];
      // if (isClient) {
      let requiredKey = "all";
      if (inputData.widgetParsedData.selectedLeagueCode === "icc") {
        requiredKey = "international";
      } else if (inputData.widgetParsedData.selectedLeagueCode === "virtual_cricket") {
        requiredKey = "virtual_cricket";
      } else if (inputData.widgetParsedData.selectedLeagueCode === "european_cricket") {
        requiredKey = "ecn";
      }
      if (inputData.widgetParsedData.preFetchedData.teamTourList) {
        inputData.widgetParsedData.preFetchedData.teamTourList.tour.forEach(tourData => {
          if (tourData.status === "1" && tourData.series && tourData.series.length) {
            if (
              requiredKey === "all" ||
              (requiredKey === "international" && (tourData.series[0].league_id === 10 || tourData.series[0].league_id === 1)) ||
              (requiredKey === "ecn" && tourData.series[0].league_id === 31)
            ) {
              inputData.widgetParsedData.tournamentsArray.push(tourData);
              tourData.series.forEach(seriesData => {
                if (seriesData.status === "1") {
                  seriesData.participants.forEach(teamData => {
                    if (!teamIdArray.includes(teamData.team_id)) {
                      teamIdArray.push(teamData.team_id);
                      inputData.widgetParsedData.teamsArray.push(teamData);
                    }
                  });
                }
              });
            }
          }
        });
      }
      if (!inputData.widgetParsedData.teamsArray.length) {
        let currentYear = new Date().getFullYear().toString();
        resp.liveMatches.concat(resp.recentMatches, resp.upcomingMatches).forEach(matchData => {
          if (matchData.start_date.split("T")[0].includes(currentYear)) {
            matchData.participants.forEach(teamData => {
              if (!teamIdArray.includes(teamData.id)) {
                teamIdArray.push(teamData.id);
                inputData.widgetParsedData.teamsArray.push({ team_id: teamData.id, team_name: teamData.name });
              }
            });
          }
        });
      }
      // Object.keys(inputData.widgetParsedData.preFetchedData.teamTourList).forEach(key => {
      //   if (requiredKey === key || requiredKey === "all") {
      //     inputData.widgetParsedData.tournamentsArray = inputData.widgetParsedData.tournamentsArray.concat(
      //       inputData.widgetParsedData.preFetchedData.teamTourList[key].men.tourlist.tours
      //     );
      //     if (inputData.widgetParsedData.showTeamFilter)
      //       inputData.widgetParsedData.teamsArray = inputData.widgetParsedData.teamsArray.concat(
      //         inputData.widgetParsedData.preFetchedData.teamTourList[key].men.teamlist.teams
      //       );
      //   }
      // });
      // }
    } else {
      let teamIdArray = [];
      inputData.widgetParsedData.teamsArray = [];
      if (
        inputData.widgetParsedData.preFetchedData.teamTourList &&
        inputData.widgetParsedData.preFetchedData.teamTourList.standings &&
        inputData.widgetParsedData.preFetchedData.teamTourList.standings.groups &&
        inputData.widgetParsedData.preFetchedData.teamTourList.standings.groups.length
      ) {
        inputData.widgetParsedData.preFetchedData.teamTourList.standings.groups.forEach(groupData => {
          inputData.widgetParsedData.teamsArray = groupData.teams.team.map(teamInfo => {
            return { team_id: teamInfo.team_id, team_name: teamInfo.team_name };
          });
        });
      } else if (
        inputData.widgetParsedData.preFetchedData.teamTourList &&
        inputData.widgetParsedData.preFetchedData.teamTourList.standings &&
        inputData.widgetParsedData.preFetchedData.teamTourList.standings.stages
      ) {
        inputData.widgetParsedData.preFetchedData.teamTourList.standings.stages.stage[0].group.forEach(groupData => {
          groupData.entities.entity.forEach(tameInfo => {
            inputData.widgetParsedData.teamsArray.push({ team_id: tameInfo.id, team_name: tameInfo.name });
          });
        });
      } else if (
        inputData.widgetParsedData.preFetchedData.teamTourList &&
        inputData.widgetParsedData.preFetchedData.teamTourList.league &&
        inputData.widgetParsedData.preFetchedData.teamTourList.league.length
      ) {
        let leagueData = inputData.widgetParsedData.preFetchedData.teamTourList.league.find(
          leagueInfo => inputData.widgetParsedData.selectedLeagueCode.toLowerCase() === leagueInfo.league_code.toLowerCase()
        );
        if (!leagueData && inputData.widgetParsedData.selectedLeagueCode === "0") {
          leagueData = {
            series: []
          };
          inputData.widgetParsedData.preFetchedData.teamTourList.league.forEach(leagueInfo => {
            if (leagueInfo && leagueInfo.series && leagueInfo.series.length) {
              leagueInfo.series.forEach(seriesData => {
                leagueData.series.push(seriesData);
              });
            }
          });
        }
        if (leagueData && leagueData.series) {
          leagueData.series.forEach(seriesData => {
            if (seriesData && seriesData.participants) {
              seriesData.participants.forEach(participantsData => {
                if (!teamIdArray.includes(participantsData.team_id)) {
                  teamIdArray.push(participantsData.team_id);
                  inputData.widgetParsedData.teamsArray.push({ team_id: participantsData.team_id, team_name: participantsData.team_name });
                }
              });
            }
          });
        }
      }

      if (!inputData.widgetParsedData.teamsArray.length) {
        // let currentYear = inputData.widgetParsedData.selectedSportId === 3 ? "2019" : "2021";
        resp.liveMatches.concat(resp.recentMatches, resp.upcomingMatches).forEach(matchData => {
          // if (matchData.start_date.split("T")[0].includes(currentYear)) {
          matchData.participants.forEach(teamData => {
            if (!teamIdArray.includes(teamData.id)) {
              teamIdArray.push(teamData.id);
              inputData.widgetParsedData.teamsArray.push({ team_id: teamData.id, team_name: teamData.name });
            }
          });
          // }
        });
      }
    }

    resp.liveMatches.sort((a, b) => {
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

    resp.recentMatches.reverse();

    resp.liveCardLists = utils.splitMatchesAndAds(resp.liveMatches, inputData.widgetParsedData.adsAfter, inputData.dataToPass.adCode);
    resp.recentCardLists = utils.splitMatchesAndAds(resp.recentMatches, inputData.widgetParsedData.adsAfter, inputData.dataToPass.adCode);
    resp.upcomingCardLists = utils.splitMatchesAndAds(resp.upcomingMatches, inputData.widgetParsedData.adsAfter, inputData.dataToPass.adCode);

    if (isClient) {
      resp.liveCardListsBackup = resp.liveCardLists.slice();
      resp.recentCardListsBackup = resp.recentCardLists.slice();
      resp.upcomingCardListsBackup = resp.upcomingCardLists.slice();

      resp.liveCardLists.length = resp.liveCardLists.length > 3 ? 3 : resp.liveCardLists.length;
      resp.recentCardLists.length = resp.recentCardLists.length > 3 ? 3 : resp.recentCardLists.length;
      resp.upcomingCardLists.length = resp.upcomingCardLists.length > 3 ? 3 : resp.upcomingCardLists.length;
    }

    if (inputData.widgetParsedData.currentTabObj.name.toLowerCase() === "live") {
      if (!resp.liveMatches || !resp.liveMatches.length) {
        if (!resp.upcomingMatches || !resp.upcomingMatches.length) {
          inputData.dataToPass.tabs_data.forEach(tabData => {
            if (tabData.name.toLowerCase() === "recent") {
              inputData.widgetParsedData.currentTabObj = tabData;
            }
          });
        } else {
          inputData.dataToPass.tabs_data.forEach(tabData => {
            if (tabData.name.toLowerCase() === "upcoming") {
              inputData.widgetParsedData.currentTabObj = tabData;
            }
          });
        }
      }
    } else if (inputData.widgetParsedData.currentTabObj.name.toLowerCase() === "upcoming") {
      if (!resp.upcomingMatches || !resp.upcomingMatches.length) {
        inputData.dataToPass.tabs_data.forEach(tabData => {
          if (tabData.name.toLowerCase() === "recent") {
            inputData.widgetParsedData.currentTabObj = tabData;
          }
        });
      }
    }

    let sport =
      inputData.widgetParsedData.selectedSportId === 1 ? "cricket" : inputData.widgetParsedData.selectedSportId === 2 ? "football" : "kabaddi";
    resp.configData.teamsArray.forEach(teamInfo => {
      teamInfo.team_name =
        utils.getTeamCustomName({ winstonLogger, id: teamInfo.team_id, customNames, sportName: sport, type: "full" }) || teamInfo.team_name;
    });
    return resp;
  },
  parseStandingsDataForGroups: (sportName, standingsData) => {
    let groups = [];
    if (sportName === "kabaddi" || sportName === "football") {
      groups = standingsData.standings.groups.map(group => {
        let obj = {
          groupName: group.name,
          teams: group.teams.team
        };
        return obj;
      });
    } else if (sportName === "cricket") {
      if (standingsData.standings.stage1.groups) {
        groups = standingsData.standings.stage1.groups.map(group => {
          group.teams = group.team;
          group.teams.forEach(team => {
            if (team.matches) team.matches = team.matches.slice(0, 5).reverse();
          });
          let obj = {
            groupName: group.name,
            teams: group.teams
          };
          return obj;
        });
      } else {
        let obj = {
          groupName: standingsData.standings.stage1.name,
          teams: []
        };
        obj.teams = standingsData.standings.stage1.team;
        obj.teams.forEach(team => {
          if (team.matches) team.matches = team.matches.slice(0, 5).reverse();
        });

        groups.push(obj);
      }
    }
    return groups;
  },
  parseStatsDetailData: widgetData => {
    widgetData.configHeaders = widgetData.statsConfig.find(statsConfigData => {
      return statsConfigData.id === widgetData.serverData.selectedStatId;
    });
    if (widgetData.statsData.leaderboard.length > 10) {
      widgetData.statsData.leaderboard.length = 10;
    }

    widgetData.playersData = widgetData.statsData.leaderboard.map(player => {
      let playerObj = {
        id: player.player_id,
        name: player.player_name,
        teamId: player.team_id,
        teamName: player.team_name,
        teamShortName: player.team_short_name
      };
      widgetData.configHeaders.attributes.forEach((header, index) => {
        playerObj[header.nodeName] = player[header.nodeName];
      });
      return playerObj;
    });
  },
  trackerDataParser: trackerDataNode => {
    let polarAreaChartData = [
      {
        value: 418,
        color: "#1696f7"
      },
      {
        value: 211,
        color: "#6DD449"
      },
      {
        value: 314,
        color: "#199cb7"
      },
      {
        value: 316,
        color: "#d8d9ec"
      },
      {
        value: 450,
        color: "#b12055"
      },
      {
        value: 389,
        color: "#c4c614"
      },
      {
        value: 454,
        color: "#e35c16"
      },
      {
        value: 621,
        color: "#b10000"
      }
    ];
    // let jsonData = selectorData.widgetData.apis.trackerData;
    let jsonData = trackerDataNode.trackerData;

    jsonData.data = {};

    for (var key in jsonData.tracker) {
      for (var i = 0; i < jsonData.tracker[key].length; i++) {
        var trackerTitleRemovingSlash = jsonData.tracker[key][i].title.replace("/", " ");
        if (jsonData.tracker[key][i].title) {
          var leagueFigureTitle = trackerTitleRemovingSlash
            .replace(/ /g, "_")
            .trim()
            .toLowerCase()
            .replace("%", "percentage");
          jsonData.data[leagueFigureTitle] = jsonData.tracker[key][i];
          if (jsonData.tracker[key][i].extra_info && jsonData.tracker[key][i].extra_info.info_table.length > 0) {
            jsonData.data[leagueFigureTitle].extra_info_obj = {};
            for (j = 0; j < jsonData.tracker[key][i].extra_info.info_table.length; j++) {
              var extraInfoTitle = jsonData.tracker[key][i].extra_info.info_table[j].title
                .replace(/ /g, "_")
                .trim()
                .toLowerCase()
                .replace("%", "percentage");
              jsonData.data[leagueFigureTitle].extra_info_obj[extraInfoTitle] = jsonData.tracker[key][i].extra_info.info_table[j];
            }
          }
        }
      }
    }
    if (jsonData.data && jsonData.data.runs_in_boundaries.title_value) {
      var runs_in_fours = parseInt(jsonData.data.fours.title_value) * 4;
      var runs_in_sixes = parseInt(jsonData.data.sixes.title_value) * 6;
      var total_in_boundary = runs_in_fours + runs_in_sixes;
      jsonData.data.foursPercent = 100 - parseInt((runs_in_fours / total_in_boundary) * 100);
      jsonData.data.sixesPercent = 100 - parseInt((runs_in_sixes / total_in_boundary) * 100);
    }
    if (
      jsonData.data.percentage_of_runs_scored &&
      jsonData.data.percentage_of_runs_scored.extra_info &&
      jsonData.data.percentage_of_runs_scored.extra_info.info_table &&
      jsonData.data.percentage_of_runs_scored.extra_info.info_table[0].table_contents &&
      jsonData.data.percentage_of_runs_scored.extra_info.info_table[0].table_contents[0].info_table &&
      jsonData.data.percentage_of_runs_scored.extra_info.info_table[0].table_contents[0].info_table[0].table_contents &&
      jsonData.data.percentage_of_runs_scored.extra_info.info_table[0].table_contents[0].info_table[0].table_contents
    ) {
      /*get runs values for 1s, 2s, 4s and 6s*/
      jsonData.data.runs_in_number = {};
      jsonData.data.scores_by_number = {};
      for (var i = 0; i < jsonData.data.percentage_of_runs_scored.extra_info.info_table.length; i++) {
        if (jsonData.data.percentage_of_runs_scored.extra_info.info_table[i].title == "Tournament") {
          if (
            jsonData.data.percentage_of_runs_scored.extra_info.info_table[i].table_contents &&
            jsonData.data.percentage_of_runs_scored.extra_info.info_table[i].table_contents[0].info_table.length > 0
          ) {
            for (var j = 0; j < jsonData.data.percentage_of_runs_scored.extra_info.info_table[i].table_contents[0].info_table.length; j++) {
              var title = jsonData.data.percentage_of_runs_scored.extra_info.info_table[i].table_contents[0].info_table[j].title;
              jsonData.data.runs_in_number[title] = {};
              if (jsonData.data.percentage_of_runs_scored.extra_info.info_table[i].table_contents[0].info_table[j].table_contents.length > 0) {
                for (
                  var k = 0;
                  k < jsonData.data.percentage_of_runs_scored.extra_info.info_table[i].table_contents[0].info_table[j].table_contents.length;
                  k++
                ) {
                  var runNodes =
                    jsonData.data.percentage_of_runs_scored.extra_info.info_table[i].table_contents[0].info_table[j].table_contents[k].name;
                  jsonData.data.runs_in_number[title][runNodes] =
                    jsonData.data.percentage_of_runs_scored.extra_info.info_table[i].table_contents[0].info_table[j].table_contents[k];
                }
              }
            }
          }
          var highestValueArray = [
            { name: "1s", value: jsonData.data.runs_in_number[1].sum_of_runsscored.value },
            { name: "2s", value: jsonData.data.runs_in_number[2].sum_of_runsscored.value },
            { name: "4s", value: jsonData.data.runs_in_number[4].sum_of_runsscored.value },
            { name: "6s", value: jsonData.data.runs_in_number[6].sum_of_runsscored.value }
          ];
          highestValueArray = highestValueArray.sort(function(obj1, obj2) {
            return obj2.value - obj1.value;
          });
          highestValueArray[0].percent = 100;
          highestValueArray[1].percent = (parseInt(highestValueArray[1].value) / parseInt(highestValueArray[0].value)) * 100;
          highestValueArray[2].percent = (parseInt(highestValueArray[2].value) / parseInt(highestValueArray[0].value)) * 100;
          highestValueArray[3].percent = (parseInt(highestValueArray[3].value) / parseInt(highestValueArray[0].value)) * 100;
          jsonData.data.scores_by_number[highestValueArray[0].name] = highestValueArray[0];
          jsonData.data.scores_by_number[highestValueArray[1].name] = highestValueArray[1];
          jsonData.data.scores_by_number[highestValueArray[2].name] = highestValueArray[2];
          jsonData.data.scores_by_number[highestValueArray[3].name] = highestValueArray[3];
          break;
        }
      }
    }
    /** calculating total catches **/
    jsonData.data.total_catches =
      parseInt(jsonData.data.catches.extra_info.info_table[0].table_contents[0].value) +
      parseInt(jsonData.data.catches.extra_info.info_table[0].table_contents[1].value);
    /** calculating zone data **/
    jsonData.data.zone = {};
    var zones = jsonData.data.runs_in_each_zone;
    if (
      zones &&
      zones.extra_info &&
      zones.extra_info.info_table &&
      zones.extra_info.info_table[0].table_contents &&
      zones.extra_info.info_table[0].table_contents[0].info_table.length > 0
    ) {
      for (var i = 0; i < zones.extra_info.info_table[0].table_contents[0].info_table.length; i++) {
        if (zones.extra_info.info_table[0].table_contents[0].info_table[i].title) {
          var zoneTitleRemovingSlash = zones.extra_info.info_table[0].table_contents[0].info_table[i].title.replace("/", " ");
          var zoneTitle = zoneTitleRemovingSlash
            .replace(/ /g, "_")
            .trim()
            .toLowerCase()
            .replace("%", "percentage");
          jsonData.data.zone[zoneTitle] = zones.extra_info.info_table[0].table_contents[0].info_table[i];
        }
      }
      polarAreaChartData[0].value = jsonData.data.zone.fine_leg.table_contents[0].value ? jsonData.data.zone.fine_leg.table_contents[0].value : 0;
      polarAreaChartData[1].value = jsonData.data.zone.square_leg.table_contents[0].value ? jsonData.data.zone.square_leg.table_contents[0].value : 0;
      polarAreaChartData[2].value = jsonData.data.zone.mid_wicket.table_contents[0].value ? jsonData.data.zone.mid_wicket.table_contents[0].value : 0;
      polarAreaChartData[3].value = jsonData.data.zone.mid_on.table_contents[0].value ? jsonData.data.zone.mid_on.table_contents[0].value : 0;
      polarAreaChartData[4].value = jsonData.data.zone.mid_off.table_contents[0].value ? jsonData.data.zone.mid_off.table_contents[0].value : 0;
      polarAreaChartData[5].value = jsonData.data.zone.cover.table_contents[0].value ? jsonData.data.zone.cover.table_contents[0].value : 0;
      polarAreaChartData[6].value = jsonData.data.zone.point.table_contents[0].value ? jsonData.data.zone.point.table_contents[0].value : 0;
      polarAreaChartData[7].value = jsonData.data.zone.third_man.table_contents[0].value ? jsonData.data.zone.third_man.table_contents[0].value : 0;
      var max = 0;
      for (var k = 0; k < polarAreaChartData.length; k++) {
        if (max < polarAreaChartData[k].value) {
          max = polarAreaChartData[k].value;
        }
      }
      polarAreaChartData[0].value = (polarAreaChartData[0].value / max) * 100;
      polarAreaChartData[1].value = (polarAreaChartData[1].value / max) * 100;
      polarAreaChartData[2].value = (polarAreaChartData[2].value / max) * 100;
      polarAreaChartData[3].value = (polarAreaChartData[3].value / max) * 100;
      polarAreaChartData[4].value = (polarAreaChartData[4].value / max) * 100;
      polarAreaChartData[5].value = (polarAreaChartData[5].value / max) * 100;
      polarAreaChartData[6].value = (polarAreaChartData[6].value / max) * 100;
      polarAreaChartData[7].value = (polarAreaChartData[7].value / max) * 100;
    }
    return { data: jsonData.data, polarAreaChartData };
  },
  seriesListingParser: (selectorData, pageInfo) => {
    let widgetParsedData = {
      years: selectorData.years,
      selectedYear: selectorData.selectedYear,
      displayTitle: selectorData.display_title,
      titleTag: selectorData.meta_info.widget_title_tag,
      applicationDomain: pageInfo.configData.cmsConfig.content.ApplicationDomain,
      showYearsDD: false
    };

    selectorData.dataToPass.applicationDomain = widgetParsedData.applicationDomain;
    widgetParsedData.serverData = JSON.stringify(selectorData.dataToPass);

    let monthYearUniqueValues = [];
    let monthYearWiseDataTours = [];
    let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    selectorData.widgetData.apis.seriesListing.tour.forEach(tourData => {
      if (tourData.status !== "1") return;
      let tourDt = tourData.tour_start.split("/");
      let year = tourDt.pop();
      let month = +tourDt[0] - 1;
      let monthYearCombo = year + "-" + month;

      if (!monthYearUniqueValues.includes(monthYearCombo)) {
        monthYearUniqueValues.push(monthYearCombo);
        monthYearWiseDataTours.push({
          monthName: monthNames[month],
          year,
          tours: [tourData]
        });
      } else {
        monthYearWiseDataTours.find((monthWiseTours, i) => {
          if (monthWiseTours.monthName === monthNames[month] && monthWiseTours.year === year) {
            monthYearWiseDataTours[i].tours.push(tourData);
            return true;
          }
          return false;
        });
      }
    });

    widgetParsedData.monthYearWiseDataTours = monthYearWiseDataTours;
    return widgetParsedData;
  },
  motmDataParser: (selectorData, { isServer, imgVersion }) => {
    let pollData = {};
    let apiData = selectorData;
    if (apiData) {
      apiData.data.forEach(poll => {
        poll.poll_option.forEach(opt => {
          opt.isLoader = false;
          opt.disabledPlayer = false;
          opt.playerActive = false;
          opt.btnDisabledAdd = true;
          opt.btnDisabledSub = true;
          opt.option = JSON.parse(opt.option);
        });
        poll.pollDesParsed = JSON.parse(poll.poll_desc);
      });
      pollData.imgVersion = imgVersion;
      pollData.pollData = apiData.data;
      let { earned_points, is_poll_submitted } = pollData.pollData[0];
      let { total_coins, coins_multiple_of, start_date, end_date } = pollData.pollData[0].pollDesParsed;

      pollData.rank = apiData.rank == "0" ? "-" : "#" + apiData.rank;
      pollData.total_points = apiData.total_points;

      pollData.total_earned_points = isServer ? 0 : earned_points;
      pollData.total_earned_points_in_match = isServer ? 0 : earned_points;
      pollData.availableCoins = isServer ? 0 : parseInt(total_coins);

      let currentPollData = pollData.pollData[0];

      pollData.buttonName = "View leaderboard";
      pollData.leaderboardType = false;
      pollData.leaderboardName = "Overall";
      pollData.currentActiveTab = "";
      pollData.eventHour = "00";
      pollData.eventMin = "00";
      pollData.eventSec = "00";
      pollData.leader_board = {};
      pollData.is_timerlock = true;
      pollData.toshowSubmitbutton = false;
      pollData.isLeaderBoardLoader = false;
      pollData.toShowLeaderpollData = false;
      pollData.isLogined = false;
      pollData.displayLogin = false;
      pollData.isloading = false;
      pollData.isLoadmoreDisable = false;

      pollData.toShowRedeemPopup = false;
      pollData.hitSubmitApi = false;
      pollData.sbUsernameExists = false;
      pollData.disableBtn = true;

      pollData.profileData = {};
      pollData.profileData.captchaError = "";
      pollData.toShowSubmitPopup = false;
      pollData.toShowLeaderBoard = false;
      pollData.isEventActive = false;
      pollData.isDisablePlayerInfo = true;
      pollData.isblinker = false;
      pollData.isSportsBetFieldBlink = false;
      pollData.is_user_leader_board = false;
      pollData.toShowMatchLeaderBoard = false;
      pollData.page_count = "1";
      pollData.page_size = "10";
      pollData.coins_multiple_of = isServer ? 0 : coins_multiple_of;

      pollData.is_poll_submitted = isServer ? 0 : is_poll_submitted;
      pollData.generatedImgPath = "";
      pollData.start_date = start_date;
      pollData.end_date = end_date;

      pollData.is_winner = false;
      pollData.hid = currentPollData.pollDesParsed.Matchdetail.Team_Home;
      pollData.aid = currentPollData.pollDesParsed.Matchdetail.Team_Away;

      pollData.homeTeam = currentPollData.poll_option.filter(el => el.option.team_id == pollData.hid);
      pollData.awayTeam = currentPollData.poll_option.filter(el => el.option.team_id == pollData.aid);

      pollData.winnerTeam = "";
      pollData.submitPollOption = [];
      pollData.userGuid = "";

      pollData.homeTeam.forEach(el => {
        el.firstName = el.option.player_name.split(" ")[0];
        el.lastName = el.option.player_name
          .split(" ")
          .splice(1)
          .join(" ");
        el.skillName = el.option.skill_name;

        if (el.is_ans > 0) {
          pollData.winnerTeam = "team1";
        }
        if (el.is_ans == 0) {
          el.disabledPlayer = true;
          el.playerActive = false;
          el.is_winner = false;
        } else {
          el.disabledPlayer = false;
          el.playerActive = true;
          el.is_winner = true;
        }
      });
      pollData.awayTeam.forEach(el => {
        el.firstName = el.option.player_name.split(" ")[0];
        el.lastName = el.option.player_name
          .split(" ")
          .splice(1)
          .join(" ");
        el.skillName = el.option.skill_name;
        if (el.is_ans > 0) {
          pollData.winnerTeam = "team2";
        }
        if (el.is_ans == 0) {
          el.disabledPlayer = true;
          el.playerActive = false;
          el.is_winner = false;
        } else {
          el.disabledPlayer = false;
          el.playerActive = true;
          el.is_winner = true;
        }
      });
      let arraySortName = "";
      if (pollData.winnerTeam == "team1") {
        arraySortName = "homeTeam";
      } else {
        arraySortName = "awayTeam";
      }
      pollData[arraySortName] = pollData[arraySortName].sort((a, b) => {
        if (a.is_ans > b.is_ans) {
          // a will be placed before b in the list
          return -1;
        } else if (a.is_ans < b.is_ans) {
          //a will be placed after b in the list
          return 1;
        }
        // a and b won’t be swapped
        return 0;
      });
    }
    return pollData;
  }
};

// Object.keys(clientServerCommon).forEach(key => {
//   exports[key] = clientServerCommon[key];
// });
exports.scoreStripPreParser = clientServerCommon.scoreStripPreParser;
exports.scoreStripDataParser = clientServerCommon.scoreStripDataParser;
exports.cricketScorecardDataParser = clientServerCommon.cricketScorecardDataParser;
exports.kabaddiPBPDataParser = clientServerCommon.kabaddiPBPDataParser;
exports.footballScorecardDataParser = clientServerCommon.footballScorecardDataParser;
exports.fixturesPagePreParser = clientServerCommon.fixturesPagePreParser;
exports.fixturesPageDataParser = clientServerCommon.fixturesPageDataParser;
exports.parseStandingsDataForGroups = clientServerCommon.parseStandingsDataForGroups;
exports.parseStatsDetailData = clientServerCommon.parseStatsDetailData;
exports.trackerDataParser = clientServerCommon.trackerDataParser;
exports.seriesListingParser = clientServerCommon.seriesListingParser;
exports.motmDataParser = clientServerCommon.motmDataParser;
