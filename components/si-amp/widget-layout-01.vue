<template>
  <article v-if="!widgetData.err" class="waf-amp article-detail">
    <div class="detail-wrapper">
      <div class="title-wrap">
        <component v-if="!!getMetaInfo.show_title" class="title" :is="getMetaInfo.article_title_tag"> {{ getTitle }}</component>

        <div class="article-description" v-if="!!getMetaInfo.show_description">
          <component
            v-if="!!getMetaInfo.show_description"
            class="title"
            :is="getMetaInfo.article_description_tag"
            v-html="getDescription"
          ></component>
        </div>
        <div class="head-wrap">
          <div class="article-meta">
            <!-- <h4 class="meta-author meta">Lorem ipsum</h4> -->
            <span class="meta-date meta" v-if="iskeyPresent('published_date')">{{ getDate }}</span>
            <a class="meta meta-category" :href="generateLink(true)" v-if="getEntityPriorityData(2)">{{ getEntityPriorityData(2).ent_disp_name }}</a>
          </div>
          <AmpShare
            :fb-app-id="configData.content.fbapp_id"
            :data-url="generateLink()"
            :data-title="getWidgetData.browser_title ? getWidgetData.browser_title : getWidgetData.title"
          />
        </div>
      </div>
      <div class="article-featured-media" :class="getClassObj">
        <figure class="img-box">
          <amp-img :src="getDataSrc" :width="getImgWidth" :height="getImgHeight" :srcset="dataSrcSet" layout="responsive" alt="">
            <noscript>
              <img :src="getDataSrc" :width="getImgWidth" :height="getImgHeight" :srcset="dataSrcSet" alt="" />
            </noscript>
          </amp-img>
        </figure>
      </div>
      <SiAdsWidgetLayout01 v-if="getAdData" :widget-data="getAdData(0)" />
      <div v-html="getWidgetData.full_text" class="content-wrap"></div>
    </div>
  </article>
</template>

<script>
import { bucketImagePath } from "~/sdk/mappers/globalStrings";
import { getDateTime, getCanonicalUrl } from "./../../sdk/WidgetLibrary/utils";
import AmpShare from "../../components/common/AmpShare";
export default {
  head() {
    try {
      return {
        script: [
          {
            innerHTML: `
            {
                  "@context": "https://schema.org",
                  "@type": "NewsArticle",
                  "url": "${this.generateLink()}",
                  "articleSection": "${this.getEntityPriorityData(1).ent_disp_name}",
                  "mainEntityOfPage": {
                      "@type": "WebPage",
                      "@id": "${this.generateLink()}"
                  },
                  "headline": "${this.getWidgetData.browser_title ? this.getWidgetData.browser_title : this.getWidgetData.title}",
                  "description": "${this.getDescriptionData}",
                  "articleBody": "${this.getFullText}",
                  "image": {
                      "@type": "ImageObject",
                      "url": "${this.generateImgPath("16by9")}&w=1024",
                      "width": 1024,
                      "height": 576
                  },
                  "datePublished": "${this.getSeoDate(this.getWidgetData.published_date)}",
                  "dateModified": "${this.getSeoDate(this.getWidgetData.modified_date)}",
                  "author": {
                      "@type": "Person",
                      "name": "${this.getWidgetData.author_name}"
                  },
                  "publisher": {
                      "@type": "Organization",
                      "name": "${this.configData.content.ClientNameTitle}",
                      "logo": {
                          "@type": "ImageObject",
                          "url": "${this.configData.content.ApplicationDomain}/static-assets/images/logo-120.png",
                          "width": 120,
                          "height": 120
                      }
                  }
              }
            `,
            type: "application/ld+json"
          }
        ]
      };
    } catch (e) {
      this.winstonLogger.error({ location: "si-amp-article-widget-layout-01-headObj", name: e.name, message: e.message });
      return {};
    }
  },
  props: {
    widgetData: Object,
    configData: Object,
    winstonLogger: Object,
    globalData: Object
  },
  components: {
    AmpShare
  },
  computed: {
    getFullText() {
      return this.getWidgetData.full_text
        .replace(/\n|\v|\r/g, "")
        .replace(/\"/g, '\\"')
        .replace(/(<([^>]+)>)/gi, "");
    },
    getDescriptionData() {
      try {
        let description = this.getWidgetData.seo ? this.getWidgetData.seo.meta_desc : this.getWidgetData.intro_text;
        return description.replace(/\n|\v|\r/g, "");
      } catch (e) {
        return "";
      }
    },
    getWidgetData() {
      return this.widgetData.widgetParsedData.data;
    },
    getDescription: function() {
      return this.getWidgetData.intro_text;
    },
    getTitle: function() {
      return this.getWidgetData.title;
    },
    getDate: function() {
      return getDateTime(this.getWidgetData.published_date, "dd mmmm,yyyy");
    },

    getSizes() {
      return this.getLayoutData.sizes;
    },

    getMetaInfo() {
      return this.widgetData.metaInfo;
    },
    toShowAd() {
      if (this.widgetData.isMobile) {
        return this.getMetaInfo.layout_data.mobile[0].show_dynamic_ad;
      }
      return this.getMetaInfo.layout_data.web[0].show_dynamic_ad;
    },

    getLayoutData() {
      if (this.widgetData.isMobile) {
        return this.getMetaInfo.layout_data.mobile[0];
      }
      return this.getMetaInfo.layout_data.web[0];
    },
    getRatio() {
      return this.getLayoutData.imgRatio;
    },
    getImgHeight() {
      return this.getLayoutData.height;
    },
    getImgWidth() {
      return this.getLayoutData.width;
    },
    getDefaultImagePath() {
      return this.widgetData.defaultImagePath;
    },

    dataSrcSet() {
      return this.getWidgetData.image_path
        ? this.getLayoutData.data_srcset.replace(/{{IMAGEPATH}}/g, this.generateImgPath(this.getLayoutData.imgRatio))
        : "";
    },
    getApplicationDomain() {
      return this.widgetData.applicationDomain;
    },
    getDefaultImagePath() {
      return this.widgetData.defaultImagePath;
    },
    getDataSrc() {
      return this.getWidgetData.image_path
        ? this.getLayoutData.data_src.replace(/{{IMAGEPATH}}/, this.generateImgPath(this.getLayoutData.imgRatio))
        : this.getApplicationDomain + this.getDefaultImagePath;
    },
    getImageVersion: function() {
      return this.configData.content.imgversion;
    },
    parsedEntityData() {
      let data = this.getWidgetData.entitydata.filter(e => e.content_count > 4);
      return data;
    },
    getCanonicalUrlStructure() {
      return this.widgetData.canonicalUrlStructure;
    },
    getClassObj() {
      let imgClass = !!this.getLayoutData.show_image ? "img-" + this.getRatio : "";
      return [imgClass];
    }
  },
  methods: {
    generateLink(isCategory) {
      return getCanonicalUrl(this.getCanonicalUrlStructure, this.getApplicationDomain + "/", this.getWidgetData, isCategory, true);
    },
    getSeoDate: function(date) {
      try {
        return getDateTime(date, "yyyy-mm-dd'T'HH:MM:ssZ");
      } catch (e) {
        this.winstonLogger.error({ location: "si-detail-widget-layout-01-date", name: e.name, message: e.message });
        return {};
      }
    },
    iskeyPresent(key) {
      return this.getWidgetData.hasOwnProperty(key);
    },
    getEntityPriorityData(priority) {
      let data = this.getWidgetData.entitydata.filter(el => el.priority == priority);
      if (data) {
        data = data[0];
      }
      return data;
    },
    getEntityLink(entity) {
      return entity.canonical;
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
    },
    getAdData(order) {
      if (this.widgetData.adData) {
        return this.widgetData.adData[order];
      }
      return [];
    }
  }
};
</script>

<style></style>
