"use strict";
const utils = {
  getMetaContent: metaName => {
    let metas = document.getElementsByTagName("meta");
    let re = new RegExp("\\b" + metaName + "\\b", "i");

    for (let meta of metas) {
      if (re.test(meta.getAttribute("name"))) {
        return meta.getAttribute("content");
      }
    }

    return "";
  },

  getCookieJSON: cookieName => {
    let cookieVal = this.getCookie(cookieName);
    if (!isNull(cookieVal)) {
      return JSON.parse(cookieVal);
    }
    return undefined;
  },

  setCookie: (cookieName, cookieValue, daysToExpire) => {
    if (!daysToExpire) {
      daysToExpire = 365;
    }
    let date = new Date();
    date.setTime(date.getTime() + daysToExpire * 24 * 60 * 60 * 1000);
    let cookieVal = cookieName + "=" + cookieValue + "; path=/; expires=" + date.toUTCString();
    document.cookie = cookieVal;
  },

  getQueryStringValue: paraName => {
    let value = decodeURIComponent(
      window.location.search.replace(
        new RegExp("^(?:.*[&\\?]" + encodeURIComponent(paraName).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"),
        "$1"
      )
    );
    return value == "" ? undefined : value;
  },

  encodeQueryString: params => {
    const keys = Object.keys(params);
    return keys.length ? "?" + keys.map(key => encodeURIComponent(key) + "=" + encodeURIComponent(params[key])).join("&") : "";
  },
  postJsonData: async (url, payLoad) => {
    let response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payLoad)
    });
    let responseData = await response.json();
    return responseData;
  },
  getJsonData: async (url, queryParams) => {
    if (undefined !== queryParams && null !== queryParams) {
      url += this.encodeQueryString(queryParams);
    }
    let response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });
    let responseJson = await response.json();
    let responseData = responseJson.content ? responseJson.content : responseJson;
    return responseData;
  },
  getCookie: cookieName => {
    let name = cookieName + "=";
    let allCookieArray = document.cookie.split(";");
    for (let i = 0; i < allCookieArray.length; i++) {
      let c = allCookieArray[i].trim();
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  },
  getCookieJSON: cookieName => {
    let cookieVal = this.getCookie(cookieName);
    if (!this.isNull(cookieVal)) {
      return JSON.parse(cookieVal);
    }
    return undefined;
  },
  deleteCookie: cookieName => {
    this.setCookie(cookieName, "", -1);
  },
  isNullString: val => {
    if (undefined === val || null === val || "" === val) {
      return true;
    }
    return false;
  },
  isNull: val => {
    if (typeof val == "string") {
      return this.isNullString(val);
    }
    if (undefined === val || null === val) {
      return true;
    }
    return false;
  },
  getInningsScore: (winstonLogger, scoreString, innings = "first") => {
    try {
      if (!scoreString) return "";
      const scores = scoreString.split("&");
      if (innings === "first") {
        if (scores.length > 1) {
          return scores[0].split(" ")[0];
        } else {
          return scores[0];
        }
      } else {
        if (scores.length > 1) {
          return scores[1];
        } else {
          return "";
        }
      }
    } catch (e) {
      if (winstonLogger) winstonLogger.error({ location: "utils-getInningsScore", name: e.name, message: e.message });
      return "";
    }
  },
  hasMultipleInnings: (winstonLogger, scoreString) => {
    try {
      if (!scoreString) return "";
      return scoreString.includes("&");
    } catch (e) {
      if (winstonLogger) winstonLogger.error({ location: "utils-getInningsScore", name: e.name, message: e.message });
    }
  },
  getTeamFlag: (winstonLogger, imagePaths, participantsObj, sport, teamId) => {
    try {
      teamId = teamId ? teamId : participantsObj && participantsObj.id ? participantsObj.id : "0";
      const sportName = sport === 1 ? "cricket" : sport === 2 ? "football" : "kabaddi";
      let imgPath = imagePaths.teamImg.replace("{{TEAM_ID}}", teamId).replace("{{SPORT}}", sportName);
      return imgPath;
    } catch (e) {
      if (winstonLogger) winstonLogger.error({ location: "utils-teamFlag", name: e.name, message: e.message });
      return "";
    }
  },
  getClosestMonth: dateArr => {
    var currDate = new Date();
    var year = currDate.getFullYear();
    var month = currDate.getMonth() + 1;
    var date = currDate.getDate();
    var str = year + "" + (month < 10 ? "0" + month : month) + "" + (date < 10 ? "0" + date : date);

    var sortedDateArr = dateArr;
    var prevFix = {
      diff: null,
      obj: {}
    };
    var nextFix = {
      diff: null,
      obj: {}
    };

    for (var i = 0; i < sortedDateArr.length; i++) {
      var diff = +sortedDateArr[i].yymmddFormat - +str;
      if (diff < 0) {
        prevFix.diff = Math.abs(diff);
        prevFix.obj = sortedDateArr[i];
      }
      if (diff >= 0) {
        nextFix.diff = diff;
        nextFix.obj = sortedDateArr[i];
        break;
      }
    }
    var result = null;
    if (prevFix.diff != null && nextFix.diff != null) {
      if (prevFix.diff > nextFix.diff) {
        result = nextFix.obj;
      } else {
        result = prevFix.obj;
      }
    } else {
      if (prevFix.diff != null && nextFix.diff == null) {
        result = prevFix.obj;
      } else if (prevFix.diff == null && nextFix.diff != null) {
        result = nextFix.obj;
      }
    }

    return result;
  },
  monthsList: dates => {
    var newMonths = [],
      mList = [];

    for (var i = 0; i < dates.length; i++) {
      var _d = dates[i];
      var _m = _d.substr(2, 2) + _d.substr(4, 4);
      if (!mList.includes(_m)) {
        mList.push(_m);
        var _d1 = _d.substr(2, 2) + "/" + _d.substr(0, 2) + "/" + _d.substr(4, 4);
        var newDate = new Date(_d1);

        var obj = {};
        obj.month = utils.getDateTime(newDate, "mmmm");
        obj.year = utils.getDateTime(newDate, "yyyy");
        obj.displayDate = obj.month + " " + obj.year;
        obj.isCurrent = false;
        obj.full_date = utils.getDateTime(newDate, "mmmm-yy");
        let m = utils.getDateTime(newDate, "mm");
        obj.dateRange = "01" + m + obj.year + "-" + new Date(obj.year, m, 0).getDate() + m + obj.year;
        obj.yymmddFormat = _d.substr(4, 4) + "" + _d.substr(2, 2) + "" + _d.substr(0, 2);
        newMonths.push(obj);
      }
    }
    return newMonths;
  },
  getYearMonthObj: yearMonthArray => {
    let yearArray = [];
    let monthsObj = {};

    yearMonthArray.forEach(data => {
      let year = data.year;
      if (!yearArray.includes(year)) {
        yearArray.push(year);
      }

      if (!monthsObj[year]) {
        monthsObj[year] = [];
      }

      monthsObj[year].push(data);
    });

    return {
      yearArray,
      monthsObj
    };
  },
  getDateTime: (date, format) => {
    try {
      let isValidDate = function(t) {
          var e = new Date(t);
          return "[object Date]" === Object.prototype.toString.call(e) ? (isNaN(e.getTime()) ? !1 : !0) : !1;
        },
        dateFormat = (function() {
          var t = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            e = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            a = /[^-+\dA-Z]/g,
            m = function(t, e) {
              for (t = String(t), e = e || 2; t.length < e; ) t = "0" + t;
              return t;
            };
          return function(n, d, r) {
            if (isValidDate(n)) {
              var y = dateFormat;
              1 != arguments.length || "[object String]" != Object.prototype.toString.call(n) || /\d/.test(n) || ((d = n), (n = void 0)),
                (n = n ? new Date(n) : new Date()),
                (d = String(y.masks[d] || d || y.masks["default"])),
                "UTC:" == d.slice(0, 4) && ((d = d.slice(4)), (r = !0));
              var i = r ? "getUTC" : "get",
                s = n[i + "Date"](),
                o = n[i + "Day"](),
                u = n[i + "Month"](),
                M = n[i + "FullYear"](),
                l = n[i + "Hours"](),
                T = n[i + "Minutes"](),
                c = n[i + "Seconds"](),
                h = n[i + "Milliseconds"](),
                g = r ? 0 : n.getTimezoneOffset(),
                D = {
                  d: s,
                  dd: m(s),
                  ddd: y.i18n.dayNames[o],
                  dddd: y.i18n.dayNames[o + 7],
                  m: u + 1,
                  mm: m(u + 1),
                  mmm: y.i18n.monthNames[u],
                  mmmm: y.i18n.monthNames[u + 12],
                  yy: String(M).slice(2),
                  yyyy: M,
                  h: l % 12 || 12,
                  hh: m(l % 12 || 12),
                  H: l,
                  HH: m(l),
                  M: T,
                  MM: m(T),
                  s: c,
                  ss: m(c),
                  l: m(h, 3),
                  L: m(h > 99 ? Math.round(h / 10) : h),
                  t: 12 > l ? "a" : "p",
                  tt: 12 > l ? "am" : "pm",
                  T: 12 > l ? "A" : "P",
                  TT: 12 > l ? "AM" : "PM",
                  Z: r ? "UTC" : (String(n).match(e) || [""]).pop().replace(a, ""),
                  o: (g > 0 ? "-" : "+") + m(100 * Math.floor(Math.abs(g) / 60) + (Math.abs(g) % 60), 4),
                  S: ["th", "st", "nd", "rd"][s % 10 > 3 ? 0 : (((s % 100) - (s % 10) != 10) * s) % 10]
                };
              return d.replace(t, function(t) {
                return t in D ? D[t] : t.slice(1, t.length - 1);
              });
            }
          };
        })();
      (dateFormat.masks = {
        default: "ddd mmm dd yyyy HH:MM:ss",
        shortDate: "m/d/yy",
        mediumDate: "mmm d, yyyy",
        longDate: "mmmm d, yyyy",
        fullDate: "dddd, mmmm d, yyyy",
        shortTime: "h:MM TT",
        mediumTime: "h:MM:ss TT",
        longTime: "h:MM:ss TT Z",
        isoDate: "yyyy-mm-dd",
        isoTime: "HH:MM:ss",
        isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
      }),
        (dateFormat.i18n = {
          dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          monthNames: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
          ]
        }),
        (Date.prototype.format = function(t, e) {
          return dateFormat(this, t, e);
        });
      let thisdte = new Date(date);
      return thisdte.format(format);
    } catch (e) {
      return "";
    }
  },
  getMatchCenterUrl: (winstonLogger, matchData, footballScoreCardMapper) => {
    try {
      if (matchData.event_islinkable === "false" || matchData.event_islinkable === "") {
        return "JavaScript:void(0);";
      }
      let sportName = matchData.sport;
      if (matchData.sport === "football" && footballScoreCardMapper[matchData.league_code]) {
        sportName += "/" + footballScoreCardMapper[matchData.league_code];
      }
      if (matchData.event_format) {
        matchData.event_format = matchData.event_format
          .trim()
          .replace(/[^\w\s]/gi, "")
          .replace(/[ ,_]/g, "-");
      }
      // const linkTo = matchData.event_coverage_level_id >= 7 ? "commentary" : "scorecard";
      const linkTo = "scorecard";

      const stringToAppend = matchData.sport === "football" ? "play-by-play" : linkTo;
      const format = matchData.sport === "cricket" ? matchData.event_format + "-match-" : "";
      const team1 = matchData.participants[0].customName.replace(/[^\w\s]/gi, "").replace(/ /g, "-");
      const team2 = matchData.participants[1].customName.replace(/[^\w\s]/gi, "").replace(/ /g, "-");
      return `/${sportName}/scores-fixtures/${stringToAppend}/${team1}-vs-${team2}-live-scores-${format}${matchData.game_id}`.toLowerCase();
    } catch (e) {
      if (winstonLogger) winstonLogger.error({ location: "utils-matchcenterUrl", name: e.name, message: e.message });
      return "JavaScript:void(0);";
    }
  },
  getTeamCustomName: ({ winstonLogger, id, customNames, sportName, participantNode, type }) => {
    try {
      if (participantNode) {
        id = participantNode.id;
      }

      let customTeamName;
      if (type === "full") {
        customTeamName =
          customNames.teams && customNames.teams[sportName] && customNames.teams[sportName][id]
            ? customNames.teams[sportName][id].custom_name
            : participantNode
            ? participantNode.name
            : "";
      } else {
        customTeamName =
          customNames.teams && customNames.teams[sportName] && customNames.teams[sportName][id]
            ? customNames.teams[sportName][id].custom_short_name
            : participantNode
            ? participantNode.short_name
            : "";
      }
      return customTeamName;
    } catch (e) {
      if (winstonLogger) winstonLogger.error({ location: "utils-teamCustomName", name: e.name, message: e.message });
      return "";
    }
  },
  getTourCustomName: ({ winstonLogger, tourId, customNames, sportName }) => {
    try {
      const tourName =
        customNames && customNames.tours && customNames.tours[sportName] && customNames.tours[sportName][tourId]
          ? customNames.tours[sportName][tourId].custom_name
          : "";
      return tourName;
    } catch (e) {
      if (winstonLogger) winstonLogger.error({ location: "utils-tourCustomName", name: e.name, message: e.message });
      return "";
    }
  },
  getCustomStatus: ({ winstonLogger, matchNode, customNames }) => {
    try {
      return matchNode.event_sub_status
        .replace(matchNode.participants[0].name, matchNode.participants[0].customName)
        .replace(matchNode.participants[1].name, matchNode.participants[1].customName);
    } catch (e) {
      if (winstonLogger) winstonLogger.error({ location: "utils-getCustomStatus", name: e.name, message: e.message });
      return "";
    }
  },
  getAssetsType: typeId => {
    const assetsMapper = require("./../mappers/assetTypeMappers");
    // let assets = assetsMapper.find(item => item.id == typeId).name;
    let assets = assetsMapper[typeId] ? assetsMapper[typeId].displayName : "";
    return !assets ? "" : assets.toLowerCase().replace(" ", "-");
  },
  commonReplacer: ({ urlObj, valuesToReplace }) => {
    let urlString = JSON.stringify(urlObj);
    Object.keys(valuesToReplace).forEach(key => {
      let rep_regex = new RegExp(`{{${key}}}`, "gi");
      urlString = urlString.replace(rep_regex, valuesToReplace[key]);
    });
    return JSON.parse(urlString);
  },
  splitMatchesAndAds: (matches, adsAfter, adCode) => {
    let cardLists = [];
    if (matches && matches.length) {
      let counter = 0;
      let maxCount = Math.ceil(matches.length / adsAfter);
      for (let i = 0; i < maxCount; i++) {
        cardLists[i] = {
          matches: [],
          adObj: {}
        };

        for (let j = 0; j < adsAfter; j++) {
          if (matches[counter]) {
            cardLists[i].matches.push(matches[counter]);
            counter++;
          }
        }
        cardLists[i].adObj = { adCode };
      }
    } else {
      cardLists[0] = {
        matches: [],
        adObj: { adCode }
      };
    }
    return cardLists;
  },
  addSlashToDomainIfNotPresent: domain => {
    try {
      if (domain.split().pop() === "/") {
        return domain;
      } else {
        return domain + "/";
      }
    } catch (e) {
      return domain;
    }
  },
  isHttpUrl(str) {
    let re = new RegExp(/http(?:s)?:\/\//g);
    if (str) return re.test(str);
    return false;
  },
  getCanonicalUrl: (canonicalUrlStructure, applicationDomain, articleWidgetData, isCategory, isAmp) => {
    try {
      if (isAmp) applicationDomain = applicationDomain + "amp/";
      if (applicationDomain.charAt(applicationDomain.length - 1) === "/") {
        applicationDomain = applicationDomain.slice(0, -1);
      }
      let url = canonicalUrlStructure.replace("{0}", applicationDomain);
      // case for external links
      if (articleWidgetData.asset_type && parseInt(articleWidgetData.asset_type) === 12) {
        let urlStr = articleWidgetData.asset_meta.url;
        if (utils.isHttpUrl(urlStr)) return urlStr.replace(/ /g, "-").toLowerCase();
        url += articleWidgetData.asset_meta.url;
        return url.replace("/{1}", "").replace("/{2}", "");
      } else if (articleWidgetData.entitydata && articleWidgetData.entitydata.length) {
        articleWidgetData.entitydata.forEach(entityData => {
          if (entityData.priority === 1 || entityData.priority === "1") {
            url = url.replace("{1}", entityData.name);
          } else if (entityData.priority === 2 || entityData.priority === "2") {
            url = url.replace("{2}", entityData.name);
          }
        });
      } else {
        if (articleWidgetData.primary_entity_name) {
          url = url.replace("{1}", articleWidgetData.primary_entity_name);
        }
        if (articleWidgetData.secondary_entity_name) {
          url = url.replace("{2}", articleWidgetData.secondary_entity_name);
        }
      }

      let extension = articleWidgetData.slug_url || articleWidgetData.title_alias;
      url = url.replace("/{1}", "").replace("/{2}", "");
      if (extension && !isCategory) url += "/" + extension;
      return url.replace(/ /g, "-").toLowerCase();
    } catch (e) {
      return "";
    }
    ro;
  },
  cleanDetailMarkup: (cheerio, markup) => {
    let response = {
      markup: "",
      scripts: []
    };

    const $ = cheerio.load(markup, { normalizeWhitespace: false, xmlMode: false, decodeEntities: true });
    let iFrames = $("iframe");
    iFrames.addClass("lazy");

    let imgTags = $("img");
    imgTags.addClass("lazy");
    imgTags.each(function(i, elem) {
      $(elem).attr({ height: "432px", width: "768px" });
    });
    let figureTag = $("figure");
    figureTag.addClass("img-box");

    $("script").each(function(i, elem) {
      if ($(this).attr("src")) response.scripts.push($(this).attr("src"));
      $(this).remove();
    });

    response.markup = $.html();
    return response;
  },
  getEventClass: event => {
    let eventClass = "";
    switch (event.event_id) {
      case 1:
        eventClass = "time active-primary";
        break;
      case 11:
        eventClass = "time active-secondary";
        break;
      case 14:
        eventClass = "time active-secondary";
        break;
      case 12:
        eventClass = "yellow-card";
        break;
      case 18:
        eventClass = "red-card";
        break;
      case 31:
        eventClass = "yellow-red-card";
        break;
      case 13:
        eventClass = "substitution";
        break;
      case 9:
        eventClass = "goal";
        break;
      case 17:
        eventClass = "goal goal-pen";
        break;
      case 16:
        eventClass = "goal goal-own";
        break;
      default:
        eventClass = "commentary";
        break;
    }
    return eventClass;
  },
  teamTourDetection: ({ route, clientCode }) => {
    let routePath = route.path;
    let queryParams = route.query;
    let respObj = {
      teamId: 0,
      teamName: "",
      tournamentId: 0,
      tournamentName: "",
      isEcnFixture: false,
      ecnQueryStringTourId: 0,
      ecnQueryStringTeamId: 0
    };
    if (clientCode === "saw01") {
      if (routePath.includes("/cricket/scores-fixtures") && (queryParams.teamid || queryParams.tournament)) {
        respObj.isEcnFixture = true;
        if (queryParams.tournament) {
          respObj.ecnQueryStringTourId = queryParams.tournament;
        } else if (queryParams.teamid) {
          respObj.ecnQueryStringTeamId = queryParams.teamid;
        }
      } else if (
        routePath.includes("/cricket/scores-fixtures/") ||
        routePath.includes("/football/scores-fixtures/") ||
        routePath.includes("/kabaddi/scores-fixtures/")
      ) {
        let teamInfo = routePath.split("/").pop();
        respObj.teamId = teamInfo.split("-").pop();
        if (isNaN(+respObj.teamId)) {
          respObj.teamId = 0;
          return respObj;
        }
        respObj.teamName = teamInfo.replace("-" + respObj.teamId, "").replace(/-/g, " ");
      } else if (
        (routePath.includes("/cricket/series/") || routePath.includes("/football/series/") || routePath.includes("/kabaddi/series/")) &&
        routePath.split("/").pop() === "scores-fixtures"
      ) {
        let tournamentInfo = routePath
          .replace("/cricket/series/", "")
          .replace("/football/series/", "")
          .replace("/kabaddi/series/", "")
          .replace("/scores-fixtures", "");
        respObj.tournamentId = tournamentInfo.split("-").pop();
        respObj.tournamentName = tournamentInfo.replace("-" + respObj.tournamentId, "").replace(/-/g, " ");
      }
    }

    if (respObj.tournamentName) {
      const words = respObj.tournamentName.split(" ");

      for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
      }
      respObj.tournamentName = words.join(" ");
    }

    if (respObj.teamName) {
      const words = respObj.teamName.split(" ");

      for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
      }
      respObj.teamName = words.join(" ");
    }
    return respObj;
  },
  cleanAMPMarkup: (cheerio, markup) => {
    const $ = cheerio.load(markup);
    // let twitterRegex = new RegExp(/(?:<blockquote[^>]*(?<="(twitter)-tweet")[^>]*>[\s\S]*?http(?:s)?:\/\/(?:www\.)?twitter.com\/[^\/]*?\/status\/(\d+)[\s\S]*<\/blockquote>)/gm);
    let twitterRegex = new RegExp(/[\s\S]*?http(?:s)?:\/\/(?:www\.)?twitter.com\/[^\/]*?\/status\/(\d+)[\s\S]*/);
    // let fbRegex = new RegExp(/(?:<iframe[^>]*?src=\"https:\/\/www\.(?<site>facebook).com\/plugins\/(?:video|post)\.php\?[^""\s]*?\%2F(?:videos|posts)\%2F(\d+)[^>]*?><\/iframe>)/);
    let fbRegex = new RegExp(
      /(http(?:s)?:\/\/www\.(?<site>facebook).com\/plugins\/(?:(video|post))\.php\?.*?href\=(.*)?\%2F(?:(videos|posts))\%2F(\d+)*)/
    );
    // let instaRegex = new RegExp(/(?:<blockquote[^>]*(?<="instagram-media")[^>]*>[\s\S]*?http(?:s)?:\/\/www.(instagram).com\/p\/([^\/""]*)[\s\S]*?<\/blockquote>)/);
    let instaRegex = new RegExp(/http(?:s)?:\/\/www.instagram.com\/p\/([^\/""]*)[\s\S]*?/);
    $("blockquote.twitter-tweet").each(function(i, elem) {
      let mrkp = $(elem).html();
      let twitterVal = twitterRegex.exec(mrkp);
      let twitterTag = $(`<amp-twitter width="300" height="300" layout="responsive" data-tweetid="${twitterVal[1]}"></amp-twitter>`);
      $(elem).replaceWith(twitterTag);
    });
    $("blockquote.instagram-media").each(function(i, elem) {
      let mrkp = $(elem).html();
      let instaVal = instaRegex.exec(mrkp);
      let instaTag = $(`<amp-instagram data-shortcode="${instaVal[1]}" data-captioned width="300" height="300" layout="responsive"></amp-instagram>`);
      $(elem).replaceWith(instaTag);
    });
    $("iframe").each(function(i, elem) {
      let src = $(elem).attr("src");
      let fbVal = fbRegex.exec(src);
      let iframeTag = ``;
      if (fbVal) {
        iframeTag = $(
          `<amp-facebook width="300" height="300" layout="responsive" data-embed-as="${fbVal[3]}" data-href="${decodeURIComponent(fbVal[4])}/${
            fbVal[5]
          }/${fbVal[6]}"></amp-facebook>`
        );
      } else {
        iframeTag = $(
          `<amp-iframe width="300" height="300" sandbox="allow-scripts allow-same-origin" layout="responsive" frameborder="0" src="${src}"></amp-iframe>`
        );
      }
      $(elem).replaceWith(iframeTag);
    });
    $("figure").addClass("img-box");
    $("img").each(function(i, elem) {
      let src = $(elem).attr("src");
      let width = "768px";
      let height = "432px";
      let imgTag = ` <amp-img src="${src}" width="${width}" height="${height}"  layout="responsive" alt="">
                      <noscript>
                        <img src="${src}" width="${width}" height="${height}"   alt="" />
                      </noscript>
                     </amp-img>`;
      $(elem).replaceWith(imgTag);
    });
    $("script").remove();
    return $.html();
  },
  getAdComponent: (dependencyArray, { isMobile, isWebView, extraTitle, noCheckForKeys }) => {
    let adComponent;
    if (dependencyArray && dependencyArray.length) {
      let adDependency = dependencyArray.find(dependencyData => {
        if (
          noCheckForKeys ||
          (isWebView && dependencyData.show_in_app) ||
          (!isWebView && isMobile && dependencyData.show_in_mobile) ||
          (!isWebView && !isMobile && dependencyData.show_in_web)
        ) {
          if (extraTitle) {
            return dependencyData.component_id === 1 && extraTitle === dependencyData.title;
          } else {
            return dependencyData.component_id === 1;
          }
        }
        return false;
      });
      let adCodeItems = adDependency && adDependency.widget_data && adDependency.widget_data.items ? adDependency.widget_data.items : [];
      if (adCodeItems && adCodeItems.length) {
        adComponent = adCodeItems.find(adData => {
          if (isWebView) {
            if (adData.ad_client && adData.ad_client.includes(3)) return true;
          } else if (isMobile) {
            if (adData.ad_client && adData.ad_client.includes(2)) return true;
          } else {
            if (adData.ad_client && adData.ad_client.includes(1)) return true;
          }
          return false;
        });
      }
    }
    return adComponent;
  },
  handleGlobalData: (globalData, replacerArray, applicationDomain) => {
    try {
      let urlString = JSON.stringify(globalData);

      replacerArray.forEach(data => {
        let rep_regex = new RegExp(`{{${data.keyToReplace}}}`, "gi");
        urlString = urlString.replace(rep_regex, data.value);
      });

      let newGlobalData = JSON.parse(urlString);
      if (newGlobalData.customCanonicalUrl) newGlobalData.customCanonicalUrl = newGlobalData.customCanonicalUrl.toLowerCase().replace(/ /g, "-");
      if (applicationDomain && newGlobalData.customCanonicalUrl && !newGlobalData.customCanonicalUrl.includes("https://"))
        newGlobalData.customCanonicalUrl = applicationDomain + "/" + newGlobalData.customCanonicalUrl;
      return newGlobalData;
    } catch (e) {
      return {};
    }
  },
  checkMaxPageRedirection: (paginationData, pageInfo, route, widgetData) => {
    if (
      paginationData &&
      paginationData.totalPages &&
      paginationData.currentPage &&
      widgetData.pagination &&
      widgetData.pagination.current_page &&
      +widgetData.pagination.current_page > +paginationData.totalPages
    ) {
      pageInfo.redirection = true;
      pageInfo.redirectToMaxPage = true;
      pageInfo.maxPageUrl = route.fullPath.replace("/page/" + widgetData.pagination.current_page, "/page/" + paginationData.totalPages);
    }
  }
};

Object.keys(utils).forEach(key => {
  exports[key] = utils[key];
});

// exports.getInningsScore = utils.getInningsScore;
// exports.hasMultipleInnings = utils.hasMultipleInnings;
// exports.getTeamFlag = utils.getTeamFlag;
// exports.getClosestMonth = utils.getClosestMonth;
// exports.monthsList = utils.monthsList;
// exports.getDateTime = utils.getDateTime;
