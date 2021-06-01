<template>
  <div v-if="!widgetData.err" class="waf-component waf-listing widget-layout-01" :class="getMetaInfo.extraclass" >
    <div class="layout-wrapper">
      <div class="waf-head">
        <div class="head-wrap">
          <h1 class="title" v-if="!!getMetaInfo.show_widget_title && getMetaInfo.widget_title_tag === 'h1'">{{ getData.title }}</h1>
          <h2 class="title" v-if="!!getMetaInfo.show_widget_title && getMetaInfo.widget_title_tag === 'h2'">{{ getData.title }}</h2>
          <h3 class="title" v-if="!!getMetaInfo.show_widget_title && getMetaInfo.widget_title_tag === 'h3'">{{ getData.title }}</h3>
          <h4 class="title" v-if="!!getMetaInfo.show_widget_title && getMetaInfo.widget_title_tag === 'h4'">{{ getData.title }}</h4>
          <h5 class="title" v-if="!!getMetaInfo.show_widget_title && getMetaInfo.widget_title_tag === 'h5'">{{ getData.title }}</h5>
          <h6 class="title" v-if="!!getMetaInfo.show_widget_title && getMetaInfo.widget_title_tag === 'h6'">{{ getData.title }}</h6>
          <p class="title" v-if="!!getMetaInfo.show_widget_title && getMetaInfo.widget_title_tag === 'p'">{{ getData.title }}</p>

          <ul class="head-tab" v-if="getMetaInfo.more_links">
            <li :key="'tab' + index" v-for="(tab, index) in Object.keys(getMetaInfo.more_links)">
              <a :href="getMetaInfo.more_links[tab]" :title="tab">{{ tab }}</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="waf-body">
        <div v-if="getParsedWrapWidgetData && getParsedWrapWidgetData.length && isWrapFirst" class="list-group-wrap">
          <ArticleWrap
            :key="'articlewrap' + index"
            :wrap-data="data"
            :meta-info="getMetaInfo"
            :ad-code="widgetData.adData"
            :application-domain="widgetData.applicationDomain"
            :default-image-path="widgetData.defaultImagePath"
            :image-version="getImageVersion"
            :preload-images="widgetData.preloadImages"
            :canonical-url-structure="widgetData.canonicalUrlStructure"
            v-for="(data, index) in getParsedWrapWidgetData"
          />
        </div>
        <ArticleWrap
          :key="'articlewrap' + index"
          :wrap-data="data"
          :meta-info="getMetaInfo"
          :ad-code="widgetData.adData"
          :application-domain="widgetData.applicationDomain"
          :default-image-path="widgetData.defaultImagePath"
          :image-version="getImageVersion"
          :preload-images="widgetData.preloadImages"
          :canonical-url-structure="widgetData.canonicalUrlStructure"
          v-for="(data, index) in getParsedNonWrapWidgetData"
        />
        <div v-if="getParsedWrapWidgetData && getParsedWrapWidgetData.length && !isWrapFirst" class="list-group-wrap">
          <ArticleWrap
            :key="'articlewrap' + index"
            :wrap-data="data"
            :meta-info="getMetaInfo"
            :ad-code="widgetData.adData"
            :application-domain="widgetData.applicationDomain"
            :default-image-path="widgetData.defaultImagePath"
            :image-version="getImageVersion"
            :preload-images="widgetData.preloadImages"
            :canonical-url-structure="widgetData.canonicalUrlStructure"
            v-for="(data, index) in getParsedWrapWidgetData"
          />
        </div>
        <div class="loadmore-wrap" v-if="getMetaInfo.loadmore_type === '1'">
          <button type="button" class="loadmore">loadmore</button>
        </div>
        <Pagination :widget-data="widgetData" v-if="getMetaInfo.loadmore_type === '3'" />
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
  },
  components: {
    Pagination,
    ArticleWrap,
  },
  computed: {
    getData() {
      return this.widgetData;
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
  },
};
</script>

<style></style>
