<template>
  <div class="waf-component widget-layout-01" v-if="!widgetData.err" :class="widgetData.extraClass">
    <div class="layout-wrapper">
      <div class="waf-head">
        <div class="head-wrap">
          <div class="title-wrap">
            <h3 class="title">{{getDetail.name}}</h3>
            <h5 class="sub-title">{{getDetail.group +' '+ getDetail.type}}</h5>
          </div>
          <div class="subheader">
            <p class="topic-description">{{getData.descriptionString}}</p>
            <!-- <div class="dropdown-wrap filter-container">
              <div class="waf-select-box">
                <span class="selected-title">All</span>
                <div class="select-box-wrap">
                  <span class="dropdown-close">Close</span>
                  
                  <ul class="select-list">
                    <li class="list-item"><a href="#">Cricket</a></li>
                    <li class="list-item"><a href="#">Football</a></li>
                    <li class="list-item"><a href="#">Kabaddi</a></li>
                    <li class="list-item"><a href="#">Tennis</a></li>
                  </ul>
                  
                  <div class="select-list">
                    <button class="list-item">Group A</button>
                    <button class="list-item">Group B</button>
                    <button class="list-item">Group C</button>
                    <button class="list-item">Group D</button>
                  </div>
                </div>
              </div>
            </div> -->
          </div>
        </div>
      </div>
      <div class="waf-body">
        <div v-if="getParsedWrapWidgetData && getParsedWrapWidgetData.length && isWrapFirst" class="list-group-wrap">
          <ArticleWrap
            :key="'articlewrap' + index"
            :wrap-data="data"
            :meta-info="getMetaInfo"
            :application-domain="getApplicationDomain"
            :default-image-path="getDefautImage"
            :image-version="getImageVersion"
            :preload-images="widgetData.preloadImages"
            :canonical-url-structure="widgetData.canonicalUrlStructure"
            :ad-code="widgetData.adData"
            v-for="(data, index) in getParsedWrapWidgetData"
          />
        </div>
        <ArticleWrap
          :key="'articlewrap' + index"
          :wrap-data="data"
          :meta-info="getMetaInfo"
          :application-domain="getApplicationDomain"
          :default-image-path="getDefautImage"
          :image-version="getImageVersion"
          :preload-images="widgetData.preloadImages"
          :canonical-url-structure="widgetData.canonicalUrlStructure"
          :ad-code="widgetData.adData"
          v-for="(data, index) in getParsedNonWrapWidgetData"
        />
        <div v-if="getParsedWrapWidgetData && getParsedWrapWidgetData.length && !isWrapFirst" class="list-group-wrap">
          <ArticleWrap
            :key="'articlewrap' + index"
            :wrap-data="data"
            :meta-info="getMetaInfo"
            :application-domain="getApplicationDomain"
            :default-image-path="getDefautImage"
            :image-version="getImageVersion"
            :preload-images="widgetData.preloadImages"
            :canonical-url-structure="widgetData.canonicalUrlStructure"
            :ad-code="widgetData.adData"
            v-for="(data, index) in getParsedWrapWidgetData"
          />
        </div>
        <div class="loadmore-wrap" v-if="widgetData.loadMoreType === '1'">
          <button type="button" class="loadmore">loadmore</button>
        </div>
        <Pagination :widget-data="widgetData" v-if="widgetData.loadMoreType === '3'" />
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from "~/components/common/Pagination";
import ArticleWrap from "~/components/common/ArticleWrap";
export default {
  props: {
    widgetData: Object,
    configData: Object,
    winstonLogger: Object,
  },
  components: {
    Pagination,
    ArticleWrap,
  },
  computed: {
    getData() {
      return this.widgetData;
    },
    getDetail() {
      return this.getData.detail;
    },

    getParsedWrapWidgetData() {
      return this.getData.parsed_widget_data.wrapData;
    },
    getParsedNonWrapWidgetData() {
      return this.getData.parsed_widget_data.nonWrapData;
    },
    getMetaInfo() {
      return this.getData.meta_info ? this.getData.meta_info : {};
    },
    isWrapFirst() {
      return this.getMetaInfo.layout_data.is_wrap_first;
    },
    getImageVersion: function () {
      return this.configData.content.imgversion;
    },
    getApplicationDomain: function () {
      return this.configData.content.ApplicationDomain;
    },
    getDefautImage: function () {
      return this.configData.content.defaultImagePath;
    },
  },
};
</script>

<style>
</style>