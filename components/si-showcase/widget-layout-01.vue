<template>
  <div v-if="!widgetData.err" class="waf-component widget-layout-01" :class="getMetaInfo.extraclass">
    <div class="layout-wrapper">
      <ArticleWrap
        :key="index"
        :wrap-data="wrapData"
        :meta-info="getMetaInfo"
        :application-domain="widgetData.applicationDomain"
        :default-image-path="widgetData.defaultImagePath"
        :image-version="getImageVersion"
        :preload-images="widgetData.preloadImages"
        :canonical-url-structure="widgetData.canonicalUrlStructure"
        :component-id="widgetData.componentId"
        v-for="(wrapData, index) in widgetData.articleWrappers"
      />
      <div class="loadmore-wrap" v-if="widgetData.loadMoreType === '1'">
        <button type="button" class="loadmore">loadmore</button>
      </div>
      <Pagination :widget-data="widgetData" v-if="widgetData.loadMoreType === '3'" />
    </div>
    <SiAdsWidgetLayout01 v-if="widgetData.adData" :widget-data="widgetData.adData" />
  </div>
</template>

<script>
import ArticleWrap from "~/components/common/ArticleWrap";
import Pagination from "~/components/common/Pagination";
import { getPageRoute } from "~/sdk/helpers/index";

export default {
  components: {
    ArticleWrap,
    Pagination
  },
  props: {
    widgetData: Object,
    winstonLogger: Object,
    configData: Object,
    preloadImages: Boolean
  },
  methods: {
    getPageRoute: function(params) {
      return getPageRoute(this.winstonLogger, this.widgetData, params);
    }
  },
  computed: {
    getMetaInfo: function() {
      return this.widgetData.metaInfo;
    },
    getImageVersion: function() {
      return this.configData.content.imgversion;
    }
  }
};
</script>
