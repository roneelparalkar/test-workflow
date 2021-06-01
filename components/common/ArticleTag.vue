<template>
  <article class="article-item" :class="getClassObj">
    <div class="article-wrap">
      <div class="article-thumbnail" v-if="isImage">
        <a :href="generateLink()">
          <figure class="img-box">
            <img
              class="lazy"
              :src="getDefaultImagePath"
              :width="getImgWidth"
              :height="getImgHeight"
              :sizes="getSizes"
              :data-src="getDataSrc"
              :data-srcset="dataSrcSet"
              alt=""
              importance="low"
            />
            <figcaption>
              <p></p>
            </figcaption>
          </figure>
          <span v-if="showIcon" class="item-type-icon">{{ article.total_assets }}</span>
        </a>
      </div>
      <div class="article-content">
        <span v-if="showIconContent" class="item-type-icon"></span>
        <a :href="generateLink()">
          <component v-if="!!getMetadata.show_title" class="article-title" :is="getMetadata.article_title_tag"> {{ getData.asset_title }}</component>
        </a>
        <div class="article-description" v-if="!!getMetadata.show_description">
          <component v-if="getData.short_desc" :is="getMetadata.article_description_tag"> {{ getData.short_desc }}</component>
        </div>
        <div class="article-meta">
          <span class="meta meta-date" v-if="!!getMetadata.show_date">{{ getFormattedDate }}</span>
          <h4 class="meta meta-author" v-if="!!getMetadata.show_author">{{ getData.display_name }}</h4>
          <a class="meta meta-category" :href="generateLink(true)" v-if="!!getMetadata.show_category">{{ getData.secondary_entity_name }}</a>
        </div>
        <Share
          v-if="getMetadata.is_share"
          :data-url="generateLink()"
          :data-img="generateImgPath(true)"
          :data-desc="getData.short_desc ? getData.short_desc : ''"
          :data-title="getData.browser_title ? getData.browser_title : getData.title"
        />
      </div>
    </div>
  </article>
</template>

<script>
import { getAssetsType, getDateTime, getCanonicalUrl } from "./../../sdk/WidgetLibrary/utils";
import { bucketImagePath } from "~/sdk/mappers/globalStrings";
import Share from "~/components/common/Share.vue";

export default {
  props: {
    componentId:Number,
    article: Object,
    metaInfo: Object,
    applicationDomain: String,
    defaultImagePath: String,
    imageVersion: String,
    preloadImages: Boolean,
    canonicalUrlStructure: String
  },
  components: {
    Share
  },
  name: "ArticleTag",
  head() {
    let preloadLinks = [];
    if (this.preloadImages && this.article.image_path) {
      preloadLinks.push({
        rel: "preload",
        as: "image",
        href: this.article.groupInfo.data_src.replace(/{{IMAGEPATH}}/, this.generateImgPath()),
        imagesizes: this.getSizes,
        imagesrcset: this.dataSrcSet
      });
    }
    return {
      link: preloadLinks
    };
  },
  computed: {
    getData() {
      return this.article;
    },
    getFormattedDate() {
      return getDateTime(this.getData.publish_date, "dd mmmm,yyyy");
    },
    getDefaultImagePath() {
      return `${this.defaultImagePath}`;
    },
    dataSrcSet() {
      return this.article.image_path ? this.article.groupInfo.data_srcset.replace(/{{IMAGEPATH}}/g, this.generateImgPath()) : "";
    },
    getDataSrc() {
      return this.article.image_path
        ? this.article.groupInfo.data_src.replace(/{{IMAGEPATH}}/, this.generateImgPath())
        : this.applicationDomain + this.defaultImagePath;
    },
    getMetadata() {
      return this.metaInfo;
    },
    getImgHeight() {
      return this.article.groupInfo.height;
    },
    getImgWidth() {
      return this.article.groupInfo.width;
    },
    getSizes() {
      return this.article.groupInfo.sizes;
    },
    isImage() {
      return this.article.groupInfo.show_image;
    },
    showIcon() {
      return !!this.getMetadata.show_item_icon;
    },
    showIconContent() {
      return !!this.metaInfo.showitem_icon_content;
    },
    getAssetsTypeData() {
      if(this.componentId && this.componentId==9)
      {
        return getAssetsType(this.article.asset_meta.content_type);
      }
      return getAssetsType(this.article.asset_type_id);
    },
    getAssetsTypeClass() {
      return "item-type-" + this.getAssetsTypeData;
    },
    getClassObj() {
      let assetClass = this.getAssetsTypeClass;
      let imgClass = !!this.article.groupInfo.show_image ? "img-" + this.article.groupInfo.imgRatio : "";
      return [assetClass, imgClass];
    }
  },
  methods: {
    replaceImageRatio(imgRatio) {
      let ratio = imgRatio.replace("by", "-");
      return this.article.image_path.replace(/(\b0\b)(?!.*\1)/g, ratio);
    },
    generateLink(isCategory) {
      return getCanonicalUrl(this.canonicalUrlStructure, this.applicationDomain, this.article,isCategory);
    },
    generateImgPath(fromShare) {
      try {
        if (this.article.image_path) {
          let imgPath = fromShare ? this.replaceImageRatio("1by1") : this.replaceImageRatio(this.article.groupInfo.imgRatio);
          let fileName = this.getData.image_file_name;
          let basePathAndImageFolder = this.applicationDomain + bucketImagePath;
          let fullImagePath = basePathAndImageFolder + imgPath + fileName + "?v=" + this.imageVersion;
          fullImagePath = fromShare ? `${fullImagePath + "&w=1200"}` : fullImagePath;
          return fullImagePath;
        } else {
          return `${this.defaultImagePath}`;
        }
      } catch (e) {
        return "";
      }
    }
  }
};
</script>

<style></style>
