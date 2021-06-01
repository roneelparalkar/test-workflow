<template>
  <div class="waf-component widget-layout-01" :class="getMetaInfo.extraclass" v-if="!widgetData.err">
    <article class="article-detail">
      <div class="article-head">
        <component v-if="!!getMetaInfo.show_title" class="title" :is="getMetaInfo.article_title_tag">{{ getTitle }}</component>
        <div class="article-description">
          <component v-if="!!getMetaInfo.show_description" :is="getMetaInfo.article_description_tag" v-html="getDescription"></component>
        </div>
        <div class="head-wrap">
          <div class="article-meta">
            <!-- <h4 class="meta-author meta">Lorem ipsum</h4> -->
            <span class="meta-date meta" v-if="iskeyPresent('published_date')">{{ getDate }}</span>
            <a class="meta meta-category" :href="generateLink(true)" v-if="getEntityPriorityData">{{ getEntityPriorityData.name }}</a>
          </div>
          <Share
            :data-img="`${generateImgPath('1by1')}&w=1200`"
            :data-url="globalData.customCanonicalUrl"
            :data-desc="getWidgetData.intro_text ? getWidgetData.intro_text : ''"
            :data-title="getWidgetData.browser_title ? getWidgetData.browser_title : getWidgetData.title"
          />
        </div>
      </div>
      <div class="article-body">
        <div :class="['embed-responsive', `embed-responsive-${getRatio}`]">
          <iframe
            id="video-detail-player"
            v-if="getWidgetData.content_source_id == 1"
            class="embed-responsive-item lazy"
            :src="this.getYtVideoUrl"
            frameborder="0"
            allowfullscreen
          ></iframe>
          <!--If Facebook then use this markup. Make sure that the Facebook SDK is loaded.-->
          <div
            v-if="getWidgetData.content_source_id == 2"
            class="fb-video embed-responsive-item lazy"
            :data-href="this.getFbVideoUrl"
            data-allowfullscreen="true"
            data-autoplay="true"
            data-lazy="true"
          ></div>
        </div>

        <SiAdsWidgetLayout01 v-if="getAdData" :widget-data="getAdData" />
      </div>
    </article>
    <div id="related-video-wrapper" :data-entities="getEntityFilteredData()" :data-otherent="getOtherEntity()" :data-url="widgetData.canonicalUrlStructure"> </div>
  </div>
</template>
<script>
import { getDateTime, getCanonicalUrl } from "~/sdk/WidgetLibrary/utils";
import { bucketImagePath } from "~/sdk/mappers/globalStrings";
import Share from "~/components/common/Share.vue";
export default {
  head() {
    try {
      return {
        script: [
          {
            innerHTML: `
            {
                  "@context": "https://schema.org",
                  "@type": "VideoObject",
                  "name": "${this.getWidgetData.browser_title ? this.getWidgetData.browser_title : this.getWidgetData.title}",
                  "url": "${this.globalData.customCanonicalUrl}",                 
                  "description": "${this.getWidgetData.seo ? this.getWidgetData.seo.meta_desc : this.getWidgetData.intro_text}",
                  "duration": "${this.getDuration}",
                  "image": {
                      "@type": "ImageObject",
                      "url": "${this.generateImgPath("16by9")}&w=1024",
                      "width": 1024,
                      "height": 576
                  },
                  "thumbnailUrl": [
                      "${this.generateImgPath("1by1")}&w=1024",
                      "${this.generateImgPath("16by9")}&w=1024",
                      "${this.generateImgPath("4by3")}&w=1024"
                  ],                 
                  "uploadDate": "${this.getSeoDate(this.getWidgetData.published_date)}",
                  "datePublished": "${this.getSeoDate(this.getWidgetData.published_date)}",
                  "contentUrl": "${
                    this.getWidgetData.content_source_id == 1
                      ? this.getYtVideoUrl
                      : this.getWidgetData.content_source_id == 2
                      ? this.getFbVideoUrl
                      : ""
                  }",
                  "embedUrl":"${
                    this.getWidgetData.content_source_id == 1
                      ? this.getYtVideoUrl
                      : this.getWidgetData.content_source_id == 2
                      ? this.getFbVideoUrl
                      : ""
                  }"
              }
            `,
            type: "application/ld+json"
          }
        ]
      };
    } catch (e) {
      this.winstonLogger.error({ location: "si-detail-widget-layout-01-headObj", name: e.name, message: e.message });
      return {};
    }
  },
  components: {
    Share
  },
  props: {
    widgetData: Object,
    configData: Object,
    winstonLogger: Object,
    globalData: Object
  },
  computed: {
    getFbVideoUrl: function() {
      return `https://www.facebook.com/facebook/videos/${this.getWidgetData.video_url}`;
    },    
    getYtVideoUrl: function() {
      return `https://www.youtube.com/embed/${this.getWidgetData.video_url}?enablejsapi=1&rel=0`;
    },
    getDescription: function() {
      return this.getWidgetData.desc;
    },
    getTitle: function() {
      return this.getWidgetData.title;
    },
    getDate: function() {
      return getDateTime(this.getWidgetData.published_date, "dd mmmm,yyyy");
    },
    getDuration() {
      let duration = this.getWidgetData.duration;
      if (duration) {
        let arr = duration.split(":");
        let returnStr = "";
        if (arr.length > 2) {
          returnStr = `PT${arr[0] !== "0" && arr[0] !== "00" ? arr[0] + "H" : ""}${arr[1]}M${arr[2]}S`;
        } else if (arr.length > 1) {
          returnStr = `PT${arr[0] !== "0" && arr[0] !== "00" ? arr[0] + "M" : ""}${arr[1] !== "0" && arr[1] !== "00" ? arr[1] + "S" : ""}`;
        }
        return returnStr ? (returnStr.length == 2 ? "" : returnStr) : "";
      }
    },
    getWidgetData() {
      return this.widgetData.widgetParsedData.data;
    },
    getEntityPriorityData() {
      let data = this.getWidgetData.entitydata.filter(el => el.priority == 2);
      if (data) {
        data = data[0];
      }
      return data;
    },
    getMetaInfo() {
      return this.widgetData.metaInfo;
    },
    getLayoutData() {
      if (this.widgetData.isMobile) {
        return this.getMetaInfo.layout_data.mobile[0];
      }
      return this.getMetaInfo.layout_data.web[0];
    },

    getAdData() {
      return this.widgetData.adData;
    },
    getRatio() {
      return this.getLayoutData.imgRatio;
    },
    getApplicationDomain() {
      return this.widgetData.applicationDomain;
    },
    getImageVersion() {
      return this.configData.content.imgversion;
    },
    getCanonicalUrlStructure() {
      return this.widgetData.canonicalUrlStructure;
    }
  },
  methods: {
    getEntityFilteredData(){
      let data = this.getWidgetData.entitydata.filter(el=> el.name.toLowerCase() === "categories" || el.name.toLowerCase() === "language").map(({entity_role_map_id}) => entity_role_map_id).join();
      return data;
    },
    getOtherEntity(){
      let data = this.getWidgetData.entitydata.filter(el=>el.name.toLowerCase() !== "categories" && el.name.toLowerCase() !== "language").map(({entity_role_map_id}) => entity_role_map_id).join()
      return data;
    },
    generateLink(isCategory) {
      return getCanonicalUrl(this.getCanonicalUrlStructure, this.getApplicationDomain, this.getWidgetData, isCategory);
    },
    getSeoDate: function(date) {
      try {
        return getDateTime(date, "yyyy-mm-dd'T'HH:MM:ssZ");
      } catch (e) {
        this.winstonLogger.error({ location: "si-videodetail-widget-layout-01-date", name: e.name, message: e.message });
        return {};
      }
    },
    iskeyPresent(key) {
      return this.getWidgetData.hasOwnProperty(key);
    },
    replaceImageRatio(imgRatio) {
      let ratio = imgRatio.replace("by", "-");
      return this.getWidgetData.image_path.replace(/(\b0\b)(?!.*\1)/g, ratio);
    },
    generateImgPath(imgRatio = "1by1") {
      try {
        if (this.getWidgetData.image_path) {
          let imgPath = this.replaceImageRatio(imgRatio);
          let fileName = this.getWidgetData.image_file_name;
          let basePathAndImageFolder = this.getApplicationDomain + bucketImagePath;
          let fullImagePath = basePathAndImageFolder + imgPath + fileName + "?v=" + this.getImageVersion;
          return fullImagePath;
        } else {
          return this.getDefaultImagePath;
        }
      } catch (e) {
        return "";
      }
    }
  }
};
</script>
