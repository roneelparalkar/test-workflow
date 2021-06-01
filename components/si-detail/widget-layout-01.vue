<template>
  <div class="waf-component widget-layout-01" :class="getMetaInfo.extraclass" v-if="!widgetData.err">
    <article class="article-detail item-type-article">
      <div class="article-head">
        <component v-if="!!getMetaInfo.show_title" class="title" :is="getMetaInfo.article_title_tag">{{ getTitle }}</component>
        <div class="article-description">
          <component v-if="!!getMetaInfo.show_description" :is="getMetaInfo.article_description_tag" v-html="getDescription"></component>
        </div>
        <div class="head-wrap">
          <div class="article-meta">
            <span class="meta-date meta" v-if="iskeyPresent('published_date')">{{ getDate }}</span>
            <a class="meta meta-category" :href="generateLink(true)" v-if="getMetaInfo.show_category">{{ getEntityPriorityData(2).ent_disp_name }}</a>
          </div>
          <Share
            :data-url="globalData.customCanonicalUrl"
            :data-img="`${generateImgPath('1by1')}&w=1200`"
            :data-desc="getWidgetData.intro_text ? getWidgetData.intro_text : ''"
            :data-title="getWidgetData.browser_title ? getWidgetData.browser_title : getWidgetData.title"
          />
        </div>
      </div>
      <div class="article-body">
        <div class="article-featured-media" :class="getClassObj">
          <span class="item-type-icon"></span>
          <figure class="img-box">
            <img
              :src="getDefaultImagePath"
              :width="getImgWidth"
              :height="getImgHeight"
              :sizes="getSizes"
              :data-src="getDataSrc"
              :data-srcset="dataSrcSet"
              class="lazy"
              alt=""
              importance="low"
            />
            <figcaption v-if="getWidgetData.imagedata">
              <p class="caption"></p>
              <p class="source"></p>
            </figcaption>
          </figure>
        </div>

        <SiAdsWidgetLayout01 v-if="getAdData(0)" :widget-data="getAdData(0)" />
        <div v-html="getWidgetData.full_text"></div>
        <SiAdsWidgetLayout01 v-if="getAdData(1)" :widget-data="getAdData(1)" />
        <div class="article-tags" v-if="parsedEntityData">
          <h2 class="tags-title">Related tags:</h2>
          <div class="tags-list">
            <a
              v-for="(entity, index) in parsedEntityCanonicalData"
              :key="`ent_can_${index}`"
              :href="getApplicationDomain + '/' + entity.url"
              class="tag-item"
              :title="entity.ent_disp_name"
              >{{ entity.ent_disp_name }}</a
            >
            <span v-for="(entity, index) in parsedEntityNonCanonicalData" :key="`ent_ncan_${index}`" class="tag-item" :title="entity.ent_disp_name">{{
              entity.ent_disp_name
            }}</span>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
import { bucketImagePath } from "~/sdk/mappers/globalStrings";
import { getDateTime, getCanonicalUrl } from "./../../sdk/WidgetLibrary/utils";
import Share from "~/components/common/Share.vue";
export default {
  head() {
    try {
      let preloadLinks = [];
      if (this.getMetaInfo.preload_images) {
        preloadLinks.push({
          rel: "preload",
          as: "image",
          href: this.getWidgetData.image_path
            ? this.getLayoutData.data_src.replace(/{{IMAGEPATH}}/, this.generateImgPath(this.getLayoutData.imgRatio))
            : this.getApplicationDomain + this.getDefaultImagePath,
          imagesizes: this.getSizes,
          imagesrcset: this.dataSrcSet
        });
      }

      let scripts = [
        {
          innerHTML: `
            {
                  "@context": "https://schema.org",
                  "@type": "NewsArticle",
                  "url": "${this.globalData.customCanonicalUrl}",
                  "articleSection": "${this.getEntityPriorityData(1).ent_disp_name}",
                  "mainEntityOfPage": {
                      "@type": "WebPage",
                      "@id": "${this.globalData.customCanonicalUrl}"
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
                  "thumbnailUrl": [
                      "${this.generateImgPath("1by1")}&w=1024",
                      "${this.generateImgPath("16by9")}&w=1024",
                      "${this.generateImgPath("4by3")}&w=1024"
                  ],
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
      ];
      let deatilScriptsToLoad = "";
      if (this.getScripts && this.getScripts.length) {
        this.getScripts.forEach(src => {
          deatilScriptsToLoad += src + "|||";
          // scripts.push({ src, body: true, async: true });
        });
      }
      if (deatilScriptsToLoad) {
        scripts.push({
          innerHTML: `window.detailScriptsToLoad = "${deatilScriptsToLoad}"`,
          type: "text/javascript",
          charset: "utf-8"
        });
      }
      return {
        script: scripts,
        link: preloadLinks
      };
    } catch (e) {
      this.winstonLogger.error({ location: "si-detail-widget-layout-01-headObj", name: e.name, message: e.message });
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
    Share
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
    getScripts() {
      return this.getWidgetData.scriptsToLoad;
    },
    getWidgetData() {
      return this.widgetData.widgetParsedData.data;
    },
    getCanonicalUrlStructure() {
      return this.widgetData.canonicalUrlStructure;
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
    getClassObj() {
      let imgClass = !!this.getLayoutData.show_image ? "img-" + this.getRatio : "";
      return [imgClass];
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
    filteredEntityData() {
      let entityUrlToFilter = [3, 4, 5, 6, 7, 15];
      let canonicalUrlFilter = [8, 11];
      let data = this.parsedEntityData.map(e => {
        if (entityUrlToFilter.includes(parseInt(e.entity_type_id)) && e.entity_url) {
          e.isUrl = true;
          e.url = e.entity_url;
        } else if (canonicalUrlFilter.includes(parseInt(e.entity_type_id)) && e.canonical_url) {
          e.isUrl = true;
          e.url = e.canonical_url;
        } else {
          e.isUrl = false;
        }
        return e;
      });
      return data;
    },
    parsedEntityCanonicalData() {
      return this.filteredEntityData.filter(e => e.isUrl === true);
    },
    parsedEntityNonCanonicalData() {
      return this.filteredEntityData.filter(e => e.isUrl === false);
    }
  },
  methods: {
    generateLink(isCategory) {
      console.log(getCanonicalUrl(this.getCanonicalUrlStructure, this.getApplicationDomain, this.getWidgetData, isCategory));
      return getCanonicalUrl(this.getCanonicalUrlStructure, this.getApplicationDomain, this.getWidgetData, isCategory);
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
