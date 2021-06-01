"use strict";
const assetTypeMapper = require("./../mappers/assetTypeMappers");

const helpers = {
  getAssetWiseClass: (winstonLogger, assetType) => {
    try {
      if (assetTypeMapper[assetType]) {
        let name = assetTypeMapper[assetType].displayName;
        name = "item-type-" + name.replace(/ /g, "-").toLowerCase();
        return assetTypeMapper[assetType];
      } else {
        return "";
      }
    } catch (e) {
      if (winstonLogger) winstonLogger.error({ location: "helper-getAssetWiseClass", name: e.name, message: e.message });
      return "";
    }
  },
  getPageNumberFromPath: pageRoute => {
    if (pageRoute.includes("/page/")) {
      let routeParams = pageRoute.split("/");
      const pageTextIndex = routeParams.indexOf("page");
      if (pageTextIndex !== -1 && routeParams[pageTextIndex + 1]) {
        return routeParams[pageTextIndex + 1];
      }
    }
    return 1;
  },
  paginationAndLoadMoreHandler: (selectorData, widgetParsedData, { paginate, helperFunctions, route, pageSize, loadMoreCount }) => {
    if (widgetParsedData.loadMoreType) {
      // widgetParsedData.routeData = route;
      if (widgetParsedData.loadMoreType === "1") {
        // Load More Button
        widgetParsedData.loadMoreUrl = selectorData.meta_info.view_more_url;
      } else if (widgetParsedData.loadMoreType === "2") {
        widgetParsedData.infiniteScroll = true;
        // Infinite scrolling
      } else if (widgetParsedData.loadMoreType === "3") {
        const pagePath = route.path;
        widgetParsedData.pagination = true;
        const totalCount = +selectorData.widget_data.pagination.total;
        const currentPage = helperFunctions.getPageNumberFromPath(pagePath);
        const maxPages = 5;
        loadMoreCount = loadMoreCount ? loadMoreCount : pageSize;
        widgetParsedData.route = pagePath;
        widgetParsedData.paginationData = paginate(totalCount, currentPage, pageSize, loadMoreCount, maxPages);
      }
    }
  },
  getPageRoute: (winstonLogger, widgetData, { isFirst, isPrevious, isLast, isNext, pageIndex }, routeObj) => {
    try {
      let link = "";
      let pageRoute = "/page";
      if (widgetData.route) {
        if (isFirst) {
          if (widgetData.paginationData.currentPage === 1) {
            return "JavaScript:void(0);";
          } else {
            link = widgetData.route.split(pageRoute)[0];
          }
        } else if (isPrevious) {
          if (widgetData.paginationData.currentPage === 1) {
            return "JavaScript:void(0);";
          } else {
            link = widgetData.route.split(pageRoute)[0] + `${pageRoute}/${widgetData.paginationData.currentPage - 1}`;
          }
        } else if (isLast) {
          if (widgetData.paginationData.currentPage === widgetData.paginationData.totalPages) {
            return "JavaScript:void(0);";
          } else {
            link = widgetData.route.split(pageRoute)[0] + `${pageRoute}/${widgetData.paginationData.totalPages}`;
          }
        } else if (isNext) {
          if (widgetData.paginationData.currentPage === widgetData.paginationData.totalPages) {
            return "JavaScript:void(0);";
          } else {
            link = widgetData.route.split(pageRoute)[0] + `${pageRoute}/${widgetData.paginationData.currentPage + 1}`;
          }
        } else if (pageIndex) {
          if (pageIndex === 1) {
            link = widgetData.route.split(pageRoute)[0];
          } else {
            link = widgetData.route.split(pageRoute)[0] + `${pageRoute}/${pageIndex}`;
          }
        }
        if (routeObj.path.indexOf("/search") === 0) {
          link = link + "?q=" + routeObj.query.q;
        }
      }
      return widgetData.applicationDomain + link.replace("//", "/");
    } catch (e) {
      winstonLogger.error({ location: "helper-getPageRoute", name: e.name, message: e.message });
      return "";
    }
  }
};

module.exports = helpers;
