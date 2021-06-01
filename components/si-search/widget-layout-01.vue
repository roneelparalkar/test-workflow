<template>
  <div class="waf-component widget-layout-01" v-if="!widgetData.err" :class="widgetData.extraClass">
    <div class="layout-wrapper">
      <div class="waf-head">
        <div class="head-wrap">
          <component v-if="!!getMetaInfo.show_title" class="title" :is="getMetaInfo.article_title_tag">{{ getTitle }}</component>
          <div class="search-bar">
            <div class="search-wrap">
              <form>
                <input type="search" id="searchFieldPage" name="" value="" class="search-input" />
                <button id="searchBtnPage" class="btn btn-search"></button>
              </form>
              <div class="dropdown-wrap filter-container" id="searchFilter" v-if="getMetaInfo.has_filter">
                <div class="waf-select-box">
                  <span class="selected-title">{{ getSelectedFilterName }}</span>
                  <div class="select-box-wrap">
                    <span class="dropdown-close" id="searchDropdownClose">Close</span>
                    <!-- Dropdown option 1 for list with links -->
                    <ul class="select-list" v-if="!!getMetaInfo.is_linkable">
                      <li class="list-item"><a :href="generateFilterHref({ entid: 0, entity_name: 'All' })" data-ent-id="0">All</a></li>
                      <li class="list-item" v-for="(cat, index) in getWidgetData.cat_data" :key="'list-item-' + index">
                        <a :href="generateFilterHref(cat)" :data-ent-id="cat.entid">{{ cat.entity_name }}</a>
                      </li>
                    </ul>
                    <!-- Dropdown option 2 for list without links -->
                    <div class="select-list" v-if="!!!getMetaInfo.has_filter">
                      <button class="list-item" :data-url="generateFilterHref({ entid: 0, entity_name: 'All' })">All</button>
                      <button
                        class="list-item"
                        :data-url="generateFilterHref(cat)"
                        v-for="(cat, index) in getWidgetData.cat_data"
                        :key="'list-item-' + index"     
                        :data-ent-id="cat.entid"
                      >
                        {{ cat.entity_name }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="search-result-info">
            <div class="search-result-header">
              <h2 class="title">
                Search results for
                <mark class="highlight">{{ getSearchedText() }}</mark>
              </h2>
            </div>
            <div class="search-count">
              <span
                >{{ getTotalCount }} records for
                <mark class="highlight">{{ getSearchedText() }}</mark>
              </span>
            </div>
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
  <div class="waf-component widget-layout-01 waf-search" v-else-if="widgetData.err">
    <div class="layout-wrapper">
      <div class="waf-head">
        <div class="head-wrap">          
          <div class="search-bar">
            <div class="search-wrap">
              <form>
                <input type="search" id="searchFieldPage" name="" value="" class="search-input" />
                <button id="searchBtnPage" class="btn btn-search"></button>
              </form>
            </div>
          </div>
          <div class="search-result-info">
            <div class="search-result-header">
              <h2 class="title">
                Search results for
                <mark class="highlight">{{ getSearchedText() }}</mark>
              </h2>
            </div>
            <div class="search-count">
              <span
                >0 records for
                <mark class="highlight">{{ getSearchedText() }}</mark>
              </span>
            </div>
          </div>
        </div>
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
    winstonLogger: Object
  },
  components: {
    Pagination,
    ArticleWrap,
  },
  computed: {
    getData() {
      return this.widgetData;
    },
    getTitle: function() {
      return this.getData.title;
    },
    getDetail() {
      return this.getData.detail;
    },
    getWidgetData() {
      return this.getData.widget_data;
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
    getTotalCount() {
      return this.getWidgetData.items[0].total_cnt;
    },
    getSelectedFilterName() {
      return this.getWidgetData.items[0].name;
    },
  },
  methods: {
    generateFilterHref(cat) {
      let queryParms = this.$route.fullPath.includes("?") ? this.$route.fullPath.split("?")[1].split("&")[0] : "";
      let url = "";
      if (cat.entid == 0) {
        url = `${this.getApplicationDomain}/search?${queryParms}`;
      } else {
        url = `${this.getApplicationDomain}/search/${cat.entid + "-" + cat.entity_name.toLowerCase()}?${queryParms}`;
      }
      return url;
    },
    getSearchedText() {
      return this.$route.query && this.$route.query.q ? this.$route.query.q : "";
    },
  },
};
</script>

<style>
</style>