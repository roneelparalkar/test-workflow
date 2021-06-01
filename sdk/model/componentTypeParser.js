"use strict";
const commonParsers = require("./../WidgetLibrary/clientServerCommon");
const cheerio = require("cheerio");
const componentTypeParser = {
  parseModules: (pageInfo, winstonLogger, params) => {
    Object.keys(pageInfo.wafModules).forEach(selector => {
      try {
        if (pageInfo.wafModules[selector].componentType) {
          if (componentTypeParser[pageInfo.wafModules[selector].componentType]) {
            pageInfo.wafModules[selector].widgetParsedData = componentTypeParser[pageInfo.wafModules[selector].componentType](
              pageInfo.wafModules[selector],
              winstonLogger,
              params,
              pageInfo
            );
          } else {
            if (pageInfo.wafModules[selector].widgetData && pageInfo.wafModules[selector].widgetData.apis) {
              pageInfo.wafModules[selector].widgetParsedData = pageInfo.wafModules[selector].widgetData.apis;
            } else if (pageInfo.wafModules[selector].widget_data) {
              pageInfo.wafModules[selector].widgetParsedData = pageInfo.wafModules[selector].widget_data;
            } else {
              pageInfo.wafModules[selector].widgetParsedData = pageInfo.wafModules[selector].widgetData;
            }
          }
          if (pageInfo.wafModules[selector].widgetParsedData) pageInfo.wafModules[selector].widgetParsedData.isServer = true;
        }
      } catch (e) {
        winstonLogger.error({
          message: { location: "componentTypeParser-" + pageInfo.wafModules[selector].componentType, name: e.name, message: e.message }
        });
        pageInfo.wafModules[selector].widgetParsedData = { err: true };
      }
    });
  },
  parsedGroupData: (selectorData, params, pageInfo) => {
    let { meta_info, widget_data, display_title, title, selector, component_id } = selectorData;
    let { isMobile, isWebView, utils } = params;
    let { layout_data } = meta_info;
    let parsedGroupWiseData = {};
    let parsedWrapData = [];
    let parsedNonwrapData = [];
    let wholeCopyArray = [];
    let layoutInfoArray = [];
    let pageSize = 0;
    if (isMobile) {
      layoutInfoArray = layout_data.mobile;
    } else {
      layoutInfoArray = layout_data.web;
    }
    let startingIndex = 0;
    wholeCopyArray = component_id == 91 ? widget_data.items[0].asset_data : widget_data.items;
    layoutInfoArray.forEach(e => {
      let { count, has_wrap, itemClass, show_dynamic_ad } = e;
      pageSize += count;
      if (wholeCopyArray) {
        const maxCount = startingIndex + count;
        let items = wholeCopyArray.slice(startingIndex, maxCount);
        items.forEach(obj => {
          obj.groupInfo = e;
        });
        let obj = {
          has_wrap,
          items,
          class: itemClass,
          show_dynamic_ad
        };

        if (e.has_wrap) {
          parsedWrapData.push(obj);
        } else {
          parsedNonwrapData.push(obj);
        }
        startingIndex += count;
      }
    });
    parsedGroupWiseData = {
      wrapData: parsedWrapData,
      nonWrapData: parsedNonwrapData
    };

    let returnObj = {
      meta_info,
      widget_data,
      display_title,
      title,
      selector,
      pageSize,
      extraClass: meta_info.extraclass,
      parsed_widget_data: parsedGroupWiseData,
      preloadImages: meta_info.preload_images ? true : false,
      canonicalUrlStructure: pageInfo.configData.cmsConfig.content.UrlStructure,
      loadMoreType: selectorData.meta_info.loadmore_type ? selectorData.meta_info.loadmore_type : 0,
      applicationDomain: pageInfo.configData.cmsConfig.content.ApplicationDomain
    };

    const adComponent = utils.getAdComponent(selectorData.dependency, { isMobile, isWebView });
    returnObj.adData = {
      adCode: adComponent ? adComponent.ad_code : "",
      extraClass: adComponent ? selectorData.dependency[0].meta_info.extraclass : ""
    };

    return returnObj;
  },
  "si-listing": (selectorData, winstonLogger, params, pageInfo) => {
    const applicationDomain = pageInfo.configData.cmsConfig.content.ApplicationDomain;
    const defaultImagePath = pageInfo.configData.cmsConfig.content.defaultImagePath;
    let { isMobile, paginate, route, helperFunctions, utils } = params;
    if (!selectorData.widget_data) {
      return { err: true };
    }
    let returnObj = componentTypeParser.parsedGroupData(selectorData, params, pageInfo);
    let { sm_row, lg_row, load_more_count } = selectorData.meta_info;
    let pageSize = isMobile ? sm_row : lg_row;
    returnObj.detail = selectorData.widget_data.detail;
    returnObj.route = route;
    returnObj.applicationDomain = applicationDomain;
    returnObj.defaultImagePath = defaultImagePath;
    if (selectorData.widget_data.pagination) {
      helperFunctions.paginationAndLoadMoreHandler(selectorData, returnObj, { paginate, helperFunctions, route, pageSize, load_more_count });
      if (returnObj.paginationData && returnObj.paginationData.currentPage && +returnObj.paginationData.currentPage > 1) {
        pageInfo.globalData.customCanonicalUrl += `/page/${returnObj.paginationData.currentPage}`;
      }

      // utils.checkMaxPageRedirection(returnObj.paginationData, pageInfo, route, selectorData.widget_data);
    }
    return returnObj;
  },
  "si-scorestrip": (selectorData, winstonLogger, { isServer }, pageInfo) => {
    if (selectorData.err) return { err: true };
    const widgetParsedData = {
      matches: [],
      isServer,
      sport: selectorData.sport,
      team: selectorData.team,
      tournament: selectorData.tournament,
      sportsArray: selectorData.sportsArray,
      selectedLeague: selectorData.selectedLeague,
      selectedSportName: selectorData.selectedSportName,
      selectedLeagueName: selectorData.selectedLeagueName,
      selectedSportInfo: selectorData.sportInfo,
      meta: selectorData.meta_info,
      serverData: JSON.stringify(selectorData.dataToPass),
      displayTitle: selectorData.display_title,
      widgetTitleTag: pageInfo.content.custom_meta_info.scores_filter.widget_title_tag,
      hasLeagueFilter: selectorData.hasLeagueFilter,
      oddsLink: selectorData.oddsLink,
      partnerLogo: selectorData.partnerLogo,
      applicationDomain: pageInfo.configData.cmsConfig.content.ApplicationDomain
    };

    // widgetParsedData.matches = commonParsers.scoreStripDataParser({
    //   matches: selectorData.widgetData.apis.multiSport.matches,
    //   marketDataArray: [],
    //   utils,
    //   winstonLogger,
    //   customNames
    // });
    widgetParsedData.footballScoreCardMapper = pageInfo.configData.cmsConfig.content.feconfig.footballScoreCardMapper;
    widgetParsedData.showMarketInfo = false;
    return widgetParsedData;
  },
  "si-fixtures": (selectorData, winstonLogger, { customNames, utils, isMobile, isWebView }, pageInfo) => {
    if (selectorData.err) return { err: true };
    selectorData.title = selectorData.display_title;
    selectorData.dataToPass.extraClass = pageInfo.content.custom_meta_info.scores_filter.extraclass;
    const adComponent = utils.getAdComponent(selectorData.dependency, { isMobile, isWebView });
    selectorData.dataToPass.adCode = adComponent ? adComponent.ad_code : "";

    let widgetParsedData = commonParsers.fixturesPageDataParser(selectorData, {
      customNames,
      utils,
      winstonLogger,
      extraClass: selectorData.dataToPass.extraClass
    });
    widgetParsedData.applicationDomain = pageInfo.configData.cmsConfig.content.ApplicationDomain;
    widgetParsedData.pageTitle = pageInfo.content.meta_info.browser_title;
    widgetParsedData.isMobile = isMobile;
    widgetParsedData.footballScoreCardMapper = pageInfo.configData.cmsConfig.content.feconfig.footballScoreCardMapper;

    if (pageInfo.content.meta_info.meta_desc)
      pageInfo.content.meta_info.meta_desc = pageInfo.content.meta_info.meta_desc
        .replace("{{TEAMNAME}}", "{{TEAMNAMESTRING}}")
        .replace("{{SERIESNAME}}", "{{SERIESNAMESTRING}}");
    if (pageInfo.content.meta_info.browser_title)
      pageInfo.content.meta_info.browser_title = pageInfo.content.meta_info.browser_title
        .replace("{{TEAMNAME}}", "{{TEAMNAMESTRING}}")
        .replace("{{SERIESNAME}}", "{{SERIESNAMESTRING}}");
    pageInfo.globalData = {
      customTitle: pageInfo.content.meta_info.browser_title,
      customCanonicalUrl: pageInfo.content.meta_info.canonical_url,
      customPageDescription: pageInfo.content.meta_info.meta_desc
    };
    const replacerArray = [
      { keyToReplace: "TEAMNAME", value: widgetParsedData.configData.selectedTeamName },
      { keyToReplace: "TEAMNAMESTRING", value: widgetParsedData.configData.selectedTeamName.replace(/-/g, " ") },
      { keyToReplace: "TEAMID", value: widgetParsedData.configData.selectedTeamId },
      { keyToReplace: "SERIESNAME", value: widgetParsedData.configData.selectedTournamentName },
      { keyToReplace: "SERIESNAMESTRING", value: widgetParsedData.configData.selectedTournamentName.replace(/-/g, " ") },
      { keyToReplace: "SERIESID", value: widgetParsedData.configData.selectedTournamentId },
      { keyToReplace: "TOURNAME", value: widgetParsedData.configData.selectedTournamentName },
      { keyToReplace: "TOURID", value: widgetParsedData.configData.selectedTournamentId }
    ];
    let applicationDomain = pageInfo.configData.cmsConfig.content.ApplicationDomain;
    pageInfo.globalData = utils.handleGlobalData(pageInfo.globalData, replacerArray, applicationDomain);

    return widgetParsedData;
  },
  "si-showcase": (selectorData, winstonLogger, { customNames, utils, isMobile, paginate, route, helperFunctions, isWebView }, pageInfo) => {
    const { meta_info, widget_data, display_title, title, selector } = selectorData;

    const widgetParsedData = {
      applicationDomain: pageInfo.configData.cmsConfig.content.ApplicationDomain,
      defaultImagePath: pageInfo.configData.cmsConfig.content.defaultImagePath,
      articleWrappers: [],
      preloadImages: meta_info.preload_images,
      metaInfo: meta_info,
      componentId: selectorData.component_id,
      canonicalUrlStructure: pageInfo.configData.cmsConfig.content.UrlStructure
    };
    const groups = isMobile ? meta_info.layout_data.mobile : meta_info.layout_data.web;
    let { sm_row, lg_row, load_more_count } = selectorData.meta_info;
    let pageSize = isMobile ? sm_row : lg_row;
    let startingIndex = 0;

    groups.forEach(groupData => {
      let { count, has_wrap, itemClass, show_dynamic_ad } = groupData;
      const maxCount = startingIndex + groupData.count;
      let items = widget_data.data.asset_map.slice(startingIndex, maxCount);
      items.forEach(obj => {
        obj.groupInfo = groupData;
        obj.asset_title = obj.asset_meta.title;
        obj.image_file_name = obj.asset_meta.image_name;
        obj.image_path = obj.asset_meta.image_path;
        obj.asset_type_id = obj.asset_type;
        obj.title_alias = obj.asset_meta.title_alias;
        obj.secondary_entity_name = "";
        if (obj.entitydata) {
          let priority2Data = obj.entitydata.find(elem => elem.priority === 2);
          if (priority2Data) obj.secondary_entity_name = priority2Data.ent_disp_name;
        }
      });
      let obj = {
        has_wrap,
        items,
        class: itemClass,
        show_dynamic_ad
      };
      startingIndex += groupData.count;
      widgetParsedData.articleWrappers.push(obj);
    });

    widgetParsedData.loadMoreType = meta_info.loadmore_type ? meta_info.loadmore_type : 0;
    const adComponent = utils.getAdComponent(selectorData.dependency, { isMobile, isWebView });
    widgetParsedData.adData = {
      adCode: adComponent ? adComponent.ad_code : "",
      extraClass: adComponent ? selectorData.dependency[0].meta_info.extraclass : ""
    };
    if (selectorData.widget_data.pagination) {
      helperFunctions.paginationAndLoadMoreHandler(selectorData, widgetParsedData, { paginate, helperFunctions, route, pageSize, load_more_count });
    }
    return widgetParsedData;
  },
  "si-statslisting": (selectorData, winstonLogger, params, pageInfo) => {
    let statsData = selectorData.widgetData.apis.stats.stats;
    let { statsKeysMapper } = selectorData.widgetConfig;

    let statsId = [1, 2, 13, 15];
    let parsedArray = [];
    parsedArray = statsData.filter(obj => {
      if (statsId.includes(obj.stat_id)) {
        let keyObj = statsKeysMapper.find(o => o.stat_id === obj.stat_id);
        let keys = "";
        if (keyObj && keyObj.data_key) {
          keys = keyObj.data_key.split("|");
          if (keys.length > 1) {
            obj.leaderboard.map(e => {
              e.data_value = "";
              keys.forEach(key => {
                e.data_value += e[key] ? e[key] : key;
              });
            });
          } else {
            obj.leaderboard.map(e => {
              e.data_value = e[keys[0]];
            });
          }
        }
        return obj;
      }
    });

    let parsedData = {
      stats: parsedArray,
      extraClass: selectorData.meta_info.extraclass,
      showWidgetTitle: selectorData.meta_info.show_widget_title,
      widgetTitleTag: selectorData.meta_info.widget_title_tag,
      displayTitle: selectorData.display_title,
      applicationDomain: pageInfo.configData.cmsConfig.content.ApplicationDomain
    };

    return parsedData;
  },
  "si-head": (selectorData, winstonLogger, params, pageInfo) => {
    let applicationDomain = pageInfo.configData.cmsConfig.content.ApplicationDomain + "/";
    const widgetParsedData = {
      title: pageInfo.content.meta_info.browser_title,
      pageDescription: pageInfo.content.meta_info.meta_desc,
      canonicalUrl: pageInfo.content.meta_info.canonical_url ? applicationDomain + pageInfo.content.meta_info.canonical_url : "",
      browserTitle: pageInfo.content.meta_info.browser_title,
      hasDataWidget: pageInfo.content.custom_meta_info.hasDataWidget,
      assetTypeId: pageInfo.content.asset_type_id,
      isMobile: params.isMobile
    };

    let { route, utils } = params;

    if (!pageInfo.content.meta_info.canonical_url) widgetParsedData.canonicalUrl = applicationDomain.slice(0, -1) + route.path;

    let articleComponent;
    if ([1, 2, 4, 29].includes(pageInfo.content.asset_type_id)) {
      articleComponent = pageInfo.content.module.find(componentInfo => {
        return (
          componentInfo.component_id === 4 ||
          componentInfo.component_id === 507 ||
          componentInfo.component_id === 11 ||
          componentInfo.component_id === 506
        );
      });
    }
    if (articleComponent) {
      let imgRatio = params.isMobile
        ? articleComponent.meta_info.layout_data.mobile[0].imgRatio
        : articleComponent.meta_info.layout_data.web[0].imgRatio;
      imgRatio = imgRatio.replace("by", "-");
      widgetParsedData.featuredImagePath =
        articleComponent.widget_data.data.image_path.replace(/(\b0\b)(?!.*\1)/g, imgRatio) + articleComponent.widget_data.data.image_file_name;
      widgetParsedData.featuredImagePath =
        applicationDomain.slice(0, -1) + pageInfo.configData.cmsConfig.content.ImageReplaceKey + widgetParsedData.featuredImagePath;

      widgetParsedData.articlePublishedDate = articleComponent.widget_data.data.published_date
        ? params.utils.getDateTime(articleComponent.widget_data.data.published_date, "yyyy-MM-dd'T'HH:mm:ss'+00:00'")
        : "";
      widgetParsedData.articleModifiedDate = articleComponent.widget_data.data.modified_date
        ? params.utils.getDateTime(articleComponent.widget_data.data.modified_date, "yyyy-MM-dd'T'HH:mm:ss'+00:00'")
        : "";

      widgetParsedData.title = articleComponent.widget_data.data.seo.browser_title || articleComponent.widget_data.data.title;

      widgetParsedData.canonicalUrl = utils.getCanonicalUrl(
        pageInfo.configData.cmsConfig.content.UrlStructure,
        applicationDomain,
        articleComponent.widget_data.data
      );
      widgetParsedData.ampCanonicalUrl = utils.getCanonicalUrl(
        pageInfo.configData.cmsConfig.content.UrlStructure,
        applicationDomain,
        articleComponent.widget_data.data,
        false,
        true
      );
    } else {
      widgetParsedData.featuredImagePath = applicationDomain.slice(0, -1) + pageInfo.configData.cmsConfig.content.defaultImagePath;
    }
    pageInfo.globalData = {
      customTitle: widgetParsedData.title,
      customCanonicalUrl: widgetParsedData.canonicalUrl,
      customPageDescription: widgetParsedData.pageDescription
    };
    let dateFormatFullMonth = utils.getDateTime(new Date(), "mmmm");
    let dateFormatFullYear = utils.getDateTime(new Date(), "yyyy");

    const replacerArray = [
      { keyToReplace: "YYYY", value: dateFormatFullYear },
      { keyToReplace: "MMMM", value: dateFormatFullMonth },
      { keyToReplace: "MMMMYYYY", value: dateFormatFullMonth + dateFormatFullYear }
    ];
    pageInfo.globalData = utils.handleGlobalData(pageInfo.globalData, replacerArray, applicationDomain);
    return widgetParsedData;
  },
  "si-amp-head": (selectorData, winstonLogger, params, pageInfo) => {
    const widgetParsedData = {
      title: pageInfo.content.meta_info.browser_title,
      pageDescription: pageInfo.content.meta_info.meta_desc,
      canonicalUrl: pageInfo.content.meta_info.canonical_url,
      browserTitle: pageInfo.content.meta_info.browser_title,
      hasDataWidget: pageInfo.content.custom_meta_info.hasDataWidget,
      assetTypeId: pageInfo.content.asset_type_id,
      isMobile: params.isMobile
    };
    let applicationDomain = pageInfo.configData.cmsConfig.content.ApplicationDomain + "/";
    let { route, utils } = params;

    widgetParsedData.canonicalUrl = applicationDomain.slice(0, -1) + route.path ? route.path : "";

    let articleComponent;
    if ([1, 2, 3, 4, 29].includes(pageInfo.content.asset_type_id)) {
      articleComponent = pageInfo.content.module.find(componentInfo => {
        return (
          componentInfo.component_id === 4 ||
          componentInfo.component_id === 507 ||
          componentInfo.component_id === 11 ||
          componentInfo.component_id === 506
        );
      });
    }
    if (articleComponent) {
      let imgRatio = params.isMobile
        ? articleComponent.meta_info.layout_data.mobile[0].imgRatio
        : articleComponent.meta_info.layout_data.web[0].imgRatio;
      imgRatio = imgRatio.replace("by", "-");
      widgetParsedData.featuredImagePath =
        articleComponent.widget_data.data.image_path.replace(/(\b0\b)(?!.*\1)/g, imgRatio) + articleComponent.widget_data.data.image_file_name;
      widgetParsedData.featuredImagePath = applicationDomain + widgetParsedData.featuredImagePath;

      widgetParsedData.articlePublishedDate = articleComponent.widget_data.data.published_date
        ? params.utils.getDateTime(articleComponent.widget_data.data.published_date, "yyyy-MM-dd'T'HH:mm:ss'+00:00'")
        : "";
      widgetParsedData.articleModifiedDate = articleComponent.widget_data.data.modified_date
        ? params.utils.getDateTime(articleComponent.widget_data.data.modified_date, "yyyy-MM-dd'T'HH:mm:ss'+00:00'")
        : "";

      widgetParsedData.canonicalUrl = utils.getCanonicalUrl(
        pageInfo.configData.cmsConfig.content.UrlStructure,
        applicationDomain,
        articleComponent.widget_data.data
      );
      widgetParsedData.ampCanonicalUrl = utils.getCanonicalUrl(
        pageInfo.configData.cmsConfig.content.UrlStructure,
        applicationDomain,
        articleComponent.widget_data.data,
        false,
        true
      );
    } else {
      widgetParsedData.featuredImagePath = applicationDomain + pageInfo.configData.cmsConfig.content.defaultImagePath;
    }
    pageInfo.globalData = {
      customTitle: widgetParsedData.title,
      customCanonicalUrl: widgetParsedData.canonicalUrl,
      customPageDescription: widgetParsedData.pageDescription
    };
    return widgetParsedData;
  },
  "si-ads": (selectorData, winstonLogger, params, pageInfo) => {
    // selectorData.widget_data.ad becomes selectorData.widget_data.items
    // selectorData.widget_data.ad.ad_code
    let { isMobile, isWebView, utils } = params;
    const adComponent = utils.getAdComponent([selectorData], { isMobile, isWebView, noCheckForKeys: true });
    if (adComponent && adComponent.ad_code) {
      if (adComponent.ad_code.includes('id="man_of_the_match"')) {
        let pollData = {};
        let isServer = params ? params.isServer : undefined;
        let isMobile = params ? !!params.isMobile : undefined;
        let isMotm = pageInfo.content.custom_meta_info.is_motm;
        let imgVersion = pageInfo.configData.cmsConfig.content.playerImg;
        if (isMotm) {
          pollData = commonParsers.motmDataParser(selectorData.widgetData.apis.pollApi.content, { isServer, imgVersion });
        }
        const widgetParsedData = {
          isMobile,
          isMotm,
          adCode: adComponent.ad_code,
          imagePaths: pageInfo.configData.widgetConfig.imagePaths,
          pollData: pollData,
          selector: selectorData.selector,
          parsedMarkup: isServer ? adComponent.ad_code.replace(/\"/g, '"').replace(/'/g, "|||") : ""
        };
        return widgetParsedData;
      } else if (adComponent.ad_code.includes("signup-component")) {
        let isServer = params ? params.isServer : undefined;
        let isMobile = params ? !!params.isMobile : undefined;
        const widgetParsedData = {
          isMobile,
          adCode: `<div id="signup-component"></div>`,
          selector: selectorData.selector,
          parsedMarkup: isServer
            ? adComponent.ad_code
                .replace(/(?:\\[rn])+/g, "")
                .replace(/\"/g, '"')
                .replace(/'/g, "|||")
            : ""
        };
        return widgetParsedData;
      } else if (adComponent.ad_code.includes("login-component")) {
        let isServer = params ? params.isServer : undefined;
        let isMobile = params ? !!params.isMobile : undefined;

        const widgetParsedData = {
          isMobile,
          adCode: `<div id="login-component"></div>`,
          selector: selectorData.selector,
          parsedMarkup: isServer ? adComponent.ad_code.replace(/\"/g, '"').replace(/'/g, "|||") : ""
        };
        return widgetParsedData;
      } else if (adComponent.ad_code.includes("profile-component")) {
        let isServer = params ? params.isServer : undefined;
        let isMobile = params ? !!params.isMobile : undefined;

        const widgetParsedData = {
          isMobile,
          adCode: `<div id="profile-component"></div>`,
          selector: selectorData.selector,
          parsedMarkup: isServer ? adComponent.ad_code.replace(/\"/g, '"').replace(/'/g, "|||") : ""
        };
        return widgetParsedData;
      } else if (adComponent.ad_code.includes("unsubscribe-component")) {
        let isServer = params ? params.isServer : undefined;
        let isMobile = params ? !!params.isMobile : undefined;

        const widgetParsedData = {
          isMobile,
          adCode: `<div id="unsubscribe-component"></div>`,
          selector: selectorData.selector,
          parsedMarkup: isServer ? adComponent.ad_code.replace(/\"/g, '"').replace(/'/g, "|||") : ""
        };
        return widgetParsedData;
      } else {
        const widgetParsedData = {
          adCode: adComponent.ad_code
        };
        return widgetParsedData;
      }
    }
    return {};
  },
  "si-menu": (selectorData, winstonLogger, { customNames, utils, isMobile, route, helperFunctions }, pageInfo) => {
    if (!selectorData.widget_data) return { err: true };
    const widgetParsedData = {
      menuList: [],
      displayTitle: selectorData.display_title,
      applicationDomain: utils.addSlashToDomainIfNotPresent(pageInfo.configData.cmsConfig.content.ApplicationDomain),
      menuTitle: selectorData.widget_data.menu_list ? selectorData.widget_data.menu_list.menu_name : "",
      currentPageId: pageInfo.content.page_id
    };
    widgetParsedData.menuList = selectorData.widget_data.menu_list.menu.sort((a, b) => a.order_number - b.order_number);
    return widgetParsedData;
  },
  "si-tracker": selectorData => {
    let fullData = commonParsers.trackerDataParser(selectorData.widgetData.apis);
    let widgetData = fullData.data;
    widgetData.seriesId = selectorData.seriesId;
    widgetData.extraClass = selectorData.meta_info.extraclass;
    return widgetData;
  },
  "si-seriesarchives": (selectorData, winstonLogger, params, pageInfo) => {
    let widgetParsedData = commonParsers.seriesListingParser(selectorData, pageInfo);

    return widgetParsedData;
  },
  "si-cricketscorecard": (selectorData, winstonLogger, { isServer, isMobile, isWebView, utils, customNames }, pageInfo) => {
    let gameData = selectorData.matchData || selectorData.widgetData.apis.gameData;
    gameData = commonParsers.cricketScorecardDataParser({ matcheData: gameData, utils, winstonLogger, customNames, isServer, isMobile });
    let selectedTeam = gameData.Teams.Team_Home;
    let selectedInn = gameData.Innings ? gameData.Innings.length - 1 : -1;
    let defaulttab = selectorData.widgetConfig.defaultTab || "scorecard";
    let gameCode = selectorData.widgetConfig.gameCode;

    let commentaryData = [];

    if (defaulttab === "commentary") {
      let commentary = selectorData.commentaryData ? selectorData.commentaryData : {};
      commentaryData = commentary && commentary.assets ? commentary.assets : [];

      for (var i = 0; i < commentaryData.length; i++) {
        var a = commentaryData[i],
          asset = "";
        (a.results = []), (a.msgOwner = "");
        var aData = a.custom_metadata && a.custom_metadata.asset;
        if (aData && aData.length) {
          try {
            aData = aData.replace(/\r?\n|\r/g, " ");
            aData = aData.replace(/\t/g, "    ");
            aData = JSON.parse(aData);
            commentaryData[i]["assets"] = aData;
          } catch (e) {
            winstonLogger.error({ location: "cricketscorecard-commentary-parsing", name: e.name, message: e.message });
          }
        }
      }
    }

    let staticData = {};
    staticData.pollTabsRequired = false;
    staticData.lastSixBalls = [];
    staticData.predictor = [];
    staticData.markets = [];
    pageInfo.globalData = {
      customTitle: pageInfo.content.meta_info.browser_title,
      customCanonicalUrl: pageInfo.content.meta_info.canonical_url,
      customPageDescription: pageInfo.content.meta_info.meta_desc
    };

    const replacerArray = [
      { keyToReplace: "HOMETEAM", value: gameData.Teams[gameData.Matchdetail.Team_Home].Name_Full },
      { keyToReplace: "AWAYTEAM", value: gameData.Teams[gameData.Matchdetail.Team_Away].Name_Full },
      { keyToReplace: "SERIESNAME", value: gameData.Matchdetail.Series.Name },
      { keyToReplace: "MATCHFORMAT", value: gameData.Matchdetail.Match.Type ? gameData.Matchdetail.Match.Type : "" },
      {
        keyToReplace: "YYYY",
        value: gameData.Matchdetail.Match.Date.split("/").pop()
      },
      { keyToReplace: "GAMECODE", value: gameCode }
    ];
    let applicationDomain = pageInfo.configData.cmsConfig.content.ApplicationDomain;
    pageInfo.globalData = utils.handleGlobalData(pageInfo.globalData, replacerArray, applicationDomain);

    let clientCode = pageInfo.configData.cmsConfig.content.clientid;
    let adComponent, bettingSitesComponent;
    if (clientCode === "saw01" && selectorData.dependency && selectorData.dependency.length) {
      adComponent = utils.getAdComponent(selectorData.dependency, { isMobile, isWebView, extraTitle: "Content Top Ad" });
      bettingSitesComponent = utils.getAdComponent(selectorData.dependency, { isMobile, isWebView, extraTitle: "Best Betting Sites" });
    }

    let oddsLink = selectorData.meta_info && selectorData.meta_info.odds_link ? selectorData.meta_info.odds_link : "";
    let partnerLogo = selectorData.meta_info && selectorData.meta_info.partner_logo ? selectorData.meta_info.partner_logo : "";

    return {
      isServer,
      gameData,
      commentaryData,
      selectedInn,
      defaulttab,
      gameCode,
      commentaryData,
      staticData,
      selectedTeam,
      adComponent,
      bettingSitesComponent,
      oddsLink,
      partnerLogo
    };
  },
  "si-kabaddiscorecard": (selectorData, winstonLogger, { isServer, isMobile, utils, customNames }, pageInfo) => {
    let gameData = selectorData.widgetData.apis.gameData;
    let gameCode = selectorData.widgetConfig.gameCode;
    let scoreTab = "scorecard";
    let statTab = "stats";
    let pbpTab = "play-by-play";

    let defaulttab = selectorData.widgetConfig.defaultTab || scoreTab;
    let commentaryData = [];
    if (defaulttab == "play-by-play") {
      commentaryData = commonParsers.kabaddiPBPDataParser({ matcheData: gameData, utils, customNames, isServer, isMobile });
    }
    pageInfo.globalData = {
      customTitle: pageInfo.content.meta_info.browser_title,
      customCanonicalUrl: pageInfo.content.meta_info.canonical_url,
      customPageDescription: pageInfo.content.meta_info.meta_desc
    };

    const replacerArray = [
      { keyToReplace: "HOMETEAM", value: gameData.teams.team[0].name },
      { keyToReplace: "AWAYTEAM", value: gameData.teams.team[1].name },
      { keyToReplace: "GAMECODE", value: gameCode }
    ];
    let applicationDomain = pageInfo.configData.cmsConfig.content.ApplicationDomain;
    pageInfo.globalData = utils.handleGlobalData(pageInfo.globalData, replacerArray, applicationDomain);

    return { gameData, defaulttab, gameCode, scoreTab, statTab, pbpTab, selectedInn: 0 };
  },
  "si-footballscorecard": (selectorData, winstonLogger, { isServer, isMobile, utils, customNames }, pageInfo) => {
    let gameData = selectorData.widgetData.apis.gameData;
    gameData.defaultTab = selectorData.widgetConfig.defaultTab || "scorecard";

    gameData = commonParsers.footballScorecardDataParser({ matcheData: gameData, utils, customNames, isServer, isMobile });

    gameData.gameCode = selectorData.widgetConfig.gameCode;
    gameData.leagueCode = selectorData.widgetConfig.leagueCode;

    pageInfo.globalData = {
      customTitle: pageInfo.content.meta_info.browser_title,
      customCanonicalUrl: pageInfo.content.meta_info.canonical_url,
      customPageDescription: pageInfo.content.meta_info.meta_desc
    };

    const replacerArray = [
      { keyToReplace: "HOMETEAM", value: gameData.teams[0].name },
      { keyToReplace: "AWAYTEAM", value: gameData.teams[1].name },
      { keyToReplace: "LEAGUENAME", value: gameData.matchDetails.series.name.split(",")[0] },
      { keyToReplace: "GAMECODE", value: gameData.gameCode }
    ];
    let applicationDomain = pageInfo.configData.cmsConfig.content.ApplicationDomain;
    pageInfo.globalData = utils.handleGlobalData(pageInfo.globalData, replacerArray, applicationDomain);
    gameData.isMobile = isMobile;
    return gameData;
  },
  "si-breadcrumb": (selectorData, winstonLogger, { isServer, isMobile, route, utils }, pageInfo) => {
    if (selectorData.exclude_entities && selectorData.exclude_entities.length) {
      let entitiesToExclude = pageInfo.content.required_entities.filter(entityData => {
        return entityData.is_required === 2;
      });
      entitiesToExclude = entitiesToExclude ? entitiesToExclude.map(entityData => entityData.entity_id) : [];

      let componentShouldBeExcluded = selectorData.exclude_entities.every(entityIdToExclude => {
        return entitiesToExclude.find(id => id === entityIdToExclude);
      });
      if (componentShouldBeExcluded) {
        return { err: true };
      }
    }

    let breadCrumb = selectorData.widget_data.items;
    let widgetParsedData = {
      applicationDomain: pageInfo.configData.cmsConfig.content.ApplicationDomain,
      fullRoutePath: pageInfo.configData.cmsConfig.content.ApplicationDomain + route.path,
      breadCrumbArray: breadCrumb,
      assetTypeId: pageInfo.content.asset_type_id,
      isRegex: !!pageInfo.content.custom_meta_info.is_regex
    };
    return widgetParsedData;
  },
  "si-detail": (selectorData, winstonLogger, { isMobile, utils, isWebView }, pageInfo) => {
    const applicationDomain = pageInfo.configData.cmsConfig.content.ApplicationDomain;
    const defaultImagePath = pageInfo.configData.cmsConfig.content.defaultImagePath;
    let widgetParsedData = {};
    let adData = [];

    if (selectorData.dependency && selectorData.dependency.length) {
      let adComponent = selectorData.dependency
        .filter(dependencyData => dependencyData.component_id === 1)
        .sort((e, b) => e.meta_info.order - b.meta_info.order);
      if (adComponent && adComponent.length) {
        adComponent.forEach(adDataObj => {
          let adComponentWidgetData = adDataObj.widget_data && adDataObj.widget_data.items ? adDataObj.widget_data.items : [];
          adComponentWidgetData.forEach(e => {
            let adCode = "";
            if (isWebView) {
              if (e.ad_client && e.ad_client.includes(3)) adCode = e.ad_code;
            } else if (isMobile) {
              if (e.ad_client && e.ad_client.includes(2)) adCode = e.ad_code;
            } else {
              if (e.ad_client && e.ad_client.includes(1)) adCode = e.ad_code;
            }
            let obj = {
              adCode: adCode ? adCode : ""
            };
            adData.push(obj);
          });
        });
      }
    }

    const $ = cheerio.load(`${selectorData.widget_data.data.desc}`);
    selectorData.widget_data.data.desc = $.text();

    let structuredDetailObj = utils.cleanDetailMarkup(cheerio, selectorData.widget_data.data.full_text);

    selectorData.widget_data.data.full_text = structuredDetailObj.markup;
    selectorData.widget_data.data.scriptsToLoad = structuredDetailObj.scripts;
    // canonicalUrl: pageInfo.content.meta_info.canonical_url ? applicationDomain + pageInfo.content.meta_info.canonical_url : "",

    widgetParsedData = {
      isMobile,
      applicationDomain,
      widgetParsedData: selectorData.widget_data,
      metaInfo: selectorData.meta_info,
      adData,
      canonicalUrlStructure: pageInfo.configData.cmsConfig.content.UrlStructure,
      defaultImagePath
    };

    if (selectorData.widget_data.data.seo) {
      pageInfo.globalData.customTitle = selectorData.widget_data.data.seo.browser_title
        ? selectorData.widget_data.data.seo.browser_title
        : selectorData.widget_data.data.title;
      pageInfo.globalData.customPageDescription = selectorData.widget_data.data.seo.meta_desc
        ? selectorData.widget_data.data.seo.meta_desc
        : selectorData.widget_data.data.intro_text;
    } else {
      pageInfo.globalData.customTitle = selectorData.widget_data.data.title;
      pageInfo.globalData.customPageDescription = selectorData.widget_data.data.intro_text;
    }
    return widgetParsedData;
  },
  "si-videodetail": (selectorData, winstonLogger, { isMobile, isWebView, utils }, pageInfo) => {
    const applicationDomain = pageInfo.configData.cmsConfig.content.ApplicationDomain;
    let widgetParsedData = {};
    let adData = {};
    const adComponent = utils.getAdComponent(selectorData.dependency, { isMobile, isWebView });
    adData = {
      adCode: adComponent ? adComponent.ad_code : "",
      extraClass: adComponent ? selectorData.dependency[0].meta_info.extraclass : ""
    };

    const $ = cheerio.load(`${selectorData.widget_data.data.desc}`);
    selectorData.widget_data.data.desc = $.text();
    if (selectorData.widget_data.data.seo) {
      pageInfo.globalData.customTitle = selectorData.widget_data.data.seo.browser_title
        ? selectorData.widget_data.data.seo.browser_title
        : selectorData.widget_data.data.title;
      pageInfo.globalData.customPageDescription = selectorData.widget_data.data.seo.meta_desc
        ? selectorData.widget_data.data.seo.meta_desc
        : selectorData.widget_data.data.intro_text;
    } else {
      pageInfo.globalData.customTitle = selectorData.widget_data.data.title;
      pageInfo.globalData.customPageDescription = selectorData.widget_data.data.intro_text;
    }
    widgetParsedData = {
      isMobile,
      applicationDomain,
      adData,
      widgetParsedData: selectorData.widget_data,
      metaInfo: selectorData.meta_info,
      canonicalUrlStructure: pageInfo.configData.cmsConfig.content.UrlStructure
    };
    return widgetParsedData;
  },
  "si-standings": (selectorData, winstonLogger, { customNames }) => {
    if (selectorData.err) return { err: true };
    let widgetParsedData = {
      groups: [],
      dataToPass: selectorData.dataToPass,
      showGroups: false
    };
    // let groupFormat = {
    //   groupName: "asdfvb",
    //   teams: [{ teamId: 4, team_name: "India" }]
    // };
    let standingsData = selectorData.widgetData.apis.standingsData;
    let sportName = selectorData.dataToPass.selectedSportName;
    widgetParsedData.customNames = customNames;
    widgetParsedData.groups = commonParsers.parseStandingsDataForGroups(sportName, standingsData);

    widgetParsedData.dataToPassString = JSON.stringify(widgetParsedData.dataToPass);
    widgetParsedData.selectedGroupIndex = 0;

    return widgetParsedData;
  },
  "si-amp": (selectorData, winstonLogger, { isMobile, utils, isWebView }, pageInfo) => {
    const applicationDomain = pageInfo.configData.cmsConfig.content.ApplicationDomain;
    const defaultImagePath = pageInfo.configData.cmsConfig.content.defaultImagePath;
    let widgetParsedData = {};
    let adData = [];
    if (selectorData.dependency && selectorData.dependency.length) {
      let adComponent = selectorData.dependency
        .filter(dependencyData => dependencyData.component_id === 1)
        .sort((e, b) => e.meta_info.order - b.meta_info.order);
      if (adComponent && adComponent.length) {
        adComponent.forEach(adDataObj => {
          let extraClass = adDataObj.meta_info.extraclass;
          let adComponentWidgetData = adDataObj.widget_data && adDataObj.widget_data.items ? adDataObj.widget_data.items : [];
          adComponentWidgetData.forEach(e => {
            let adCode = "";
            if (isWebView) {
              if (e.ad_client && e.ad_client.includes(3)) adCode = e.ad_code;
            } else if (isMobile) {
              if (e.ad_client && e.ad_client.includes(2)) adCode = e.ad_code;
            } else {
              if (e.ad_client && e.ad_client.includes(1)) adCode = e.ad_code;
            }
            let obj = {
              adCode: adCode ? adCode : "",
              extraClass
            };
            adData.push(obj);
          });
        });
      }
    }
    // const $ = cheerio.load(`${selectorData.widget_data.data.full_text}`);
    // selectorData.widget_data.data.full_text = $.text();

    let structuredDetailObj = utils.cleanAMPMarkup(cheerio, selectorData.widget_data.data.full_text);

    selectorData.widget_data.data.full_text = structuredDetailObj;
    if (selectorData.widget_data.data.seo) {
      pageInfo.globalData.customTitle = selectorData.widget_data.data.seo.browser_title
        ? selectorData.widget_data.data.seo.browser_title
        : selectorData.widget_data.data.title;
      pageInfo.globalData.customPageDescription = selectorData.widget_data.data.seo.meta_desc
        ? selectorData.widget_data.data.seo.meta_desc
        : selectorData.widget_data.data.intro_text;
    } else {
      pageInfo.globalData.customTitle = selectorData.widget_data.data.title;
      pageInfo.globalData.customPageDescription = selectorData.widget_data.data.intro_text;
    }
    widgetParsedData = {
      isMobile,
      applicationDomain,
      widgetParsedData: selectorData.widget_data,
      metaInfo: selectorData.meta_info,
      canonicalUrlStructure: pageInfo.configData.cmsConfig.content.UrlStructure,
      adData,
      defaultImagePath
    };

    return widgetParsedData;
  },
  "si-ampvideo": (selectorData, winstonLogger, { isMobile, utils, isWebView }, pageInfo) => {
    const applicationDomain = pageInfo.configData.cmsConfig.content.ApplicationDomain;
    let widgetParsedData = {};
    let adData = {};

    const adComponent = utils.getAdComponent(selectorData.dependency, { isMobile, isWebView });
    adData = {
      adCode: adComponent ? adComponent.ad_code : "",
      extraClass: adComponent ? selectorData.dependency[0].meta_info.extraclass : ""
    };

    if (selectorData.widget_data && selectorData.widget_data.data && selectorData.widget_data.data.desc) {
      const $ = cheerio.load(`${selectorData.widget_data.data.full_text}`);
      selectorData.widget_data.data.full_text = $.text();
    } else {
      selectorData.widget_data ? (selectorData.widget_data.data = { desc: "" }) : (selectorData.widget_data = { data: { desc: "" } });
    }
    if (selectorData.widget_data.data.seo) {
      pageInfo.globalData.customTitle = selectorData.widget_data.data.seo.browser_title
        ? selectorData.widget_data.data.seo.browser_title
        : selectorData.widget_data.data.title;
      pageInfo.globalData.customPageDescription = selectorData.widget_data.data.seo.meta_desc
        ? selectorData.widget_data.data.seo.meta_desc
        : pageInfo.globalData.customTitle;
    } else {
      pageInfo.globalData.customTitle = selectorData.widget_data.data.title;
      pageInfo.globalData.customPageDescription = selectorData.widget_data.data.title;
    }
    widgetParsedData = {
      isMobile,
      applicationDomain,
      adData,
      widgetParsedData: selectorData.widget_data,
      metaInfo: selectorData.meta_info,
      canonicalUrlStructure: pageInfo.configData.cmsConfig.content.UrlStructure
    };

    return widgetParsedData;
  },
  "si-tagcontentlisting": (selectorData, winstonLogger, params, pageInfo) => {
    let { paginate, route, helperFunctions, isMobile, utils } = params;
    let { sm_row, lg_row, load_more_count } = selectorData.meta_info;
    let returnObj = componentTypeParser.parsedGroupData(selectorData, params, pageInfo);
    let pageSize = isMobile ? sm_row : lg_row;
    returnObj.detail = selectorData.widget_data.detail;

    pageInfo.globalData = {
      customTitle: pageInfo.content.meta_info.browser_title,
      customCanonicalUrl: pageInfo.content.meta_info.canonical_url,
      customPageDescription: pageInfo.content.meta_info.meta_desc
    };

    const replacerArray = [
      { keyToReplace: "NAME", value: returnObj.detail.name },
      { keyToReplace: "GROUP", value: returnObj.detail.group },
      { keyToReplace: "TYPE", value: returnObj.detail.type },
      { keyToReplace: "ENTITYROLEID", value: returnObj.detail.entity_role_map_id }
    ];
    let applicationDomain = pageInfo.configData.cmsConfig.content.ApplicationDomain;
    pageInfo.globalData = utils.handleGlobalData(pageInfo.globalData, replacerArray, applicationDomain);
    let descriptionString = `Get all the latest news, features, videos and more on the {{GROUP}} {{TYPE}} {{NAME}}.`;

    replacerArray.forEach(data => {
      let rep_regex = new RegExp(`{{${data.keyToReplace}}}`, "gi");
      descriptionString = descriptionString.replace(rep_regex, data.value);
    });
    returnObj.descriptionString = descriptionString;
    if (selectorData.widget_data.pagination) {
      helperFunctions.paginationAndLoadMoreHandler(selectorData, returnObj, { paginate, helperFunctions, route, pageSize, load_more_count });
      if (returnObj.paginationData && returnObj.paginationData.currentPage && +returnObj.paginationData.currentPage > 1) {
        pageInfo.globalData.customCanonicalUrl += `/page/${returnObj.paginationData.currentPage}`;
      }

      utils.checkMaxPageRedirection(returnObj.paginationData, pageInfo, route, selectorData.widget_data);
    }
    return returnObj;
  },
  "si-statsdetail": (selectorData, winstonLogger, params) => {
    if (!selectorData.widgetData.apis.stats.leaderboard) return { err: true };
    let serverData = {
      extraClass: selectorData.meta_info.extraclass,
      displayTitle: selectorData.display_title,
      widgetTitleTag: selectorData.meta_info.widget_title_tag,
      showWidgetTitle: selectorData.meta_info.show_widget_title,
      seriesId: selectorData.meta_info.stats_filter.series_id,
      selectedStatId: selectorData.selectedStatId
    };

    let serverDataString = JSON.stringify(serverData);
    let widgetParsedData = {
      serverData,
      serverDataString,
      statsConfig: selectorData.widgetConfig.statsConfig,
      statsData: selectorData.widgetData.apis.stats,
      isMobile: params.isMobile
    };
    commonParsers.parseStatsDetailData(widgetParsedData);
    widgetParsedData.selectedStatType = "batting";
    return widgetParsedData;
  },
  "si-search": (selectorData, winstonLogger, params, pageInfo) => {
    let { paginate, route, helperFunctions, isMobile, utils } = params;
    let returnObj = componentTypeParser.parsedGroupData(selectorData, params, pageInfo);
    let { sm_row, lg_row, load_more_count } = selectorData.meta_info;
    let pageSize = isMobile ? sm_row : lg_row;
    returnObj.detail = selectorData.widget_data.detail;
    returnObj.catDataArray = selectorData.widget_data.cat_data || [];
    returnObj.selectedCatId =
      selectorData.widget_data.items && selectorData.widget_data.items.length ? selectorData.widget_data.items[0].total_cnt : 0;
    returnObj.route = route;

    let currentCatInfo = returnObj.catDataArray.find(catData => catData.cnt === returnObj.selectedCatId);

    // if (currentCatInfo && currentCatInfo.entity_name && currentCatInfo.entid) {
    //   pageInfo.globalData.customCanonicalUrl = pageInfo.globalData.customCanonicalUrl.replace(
    //     "(/{{entityid}}-{{category}})",
    //     "/{{entityid}}-{{category}}"
    //   );
    //   const replacerArray = [
    //     { keyToReplace: "entityid", value: currentCatInfo.entid },
    //     { keyToReplace: "category", value: currentCatInfo.entity_name }
    //   ];
    //   let applicationDomain = pageInfo.configData.cmsConfig.content.ApplicationDomain;
    //   pageInfo.globalData = utils.handleGlobalData(pageInfo.globalData, replacerArray, applicationDomain);
    // }
    pageInfo.globalData.customCanonicalUrl = pageInfo.configData.cmsConfig.content.ApplicationDomain;
    if (selectorData.widget_data.pagination) {
      helperFunctions.paginationAndLoadMoreHandler(selectorData, returnObj, { paginate, helperFunctions, route, pageSize, load_more_count });
      // if (returnObj.paginationData && returnObj.paginationData.currentPage && +returnObj.paginationData.currentPage > 1) {
      //   pageInfo.globalData.customCanonicalUrl = pageInfo.globalData.customCanonicalUrl.replace(
      //     "(/page/{{pageno}})",
      //     `/page/${returnObj.paginationData.currentPage}`
      //   );
      // }

      utils.checkMaxPageRedirection(returnObj.paginationData, pageInfo, route, selectorData.widget_data);
    }

    pageInfo.globalData.customCanonicalUrl = pageInfo.globalData.customCanonicalUrl
      .replace("(/{{entityid}}-{{category}})", "")
      .replace("(/page/{{pageno}})", "")
      .replace("{{encodedqueryparam}}", route.query.q ? route.query.q.replace(/\+/g, "%20") : "");
    return returnObj;
  }
};

Object.keys(componentTypeParser).forEach(key => {
  exports[key] = componentTypeParser[key];
  let replacedKey = key.replace("-", "");
  exports[replacedKey] = componentTypeParser[key];
});
