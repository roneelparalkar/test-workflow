<template>
  <div class="article-list" :class="wrapData.class + '-list'">
    <ArticleTag
      :component-id="componentId"
      :application-domain="applicationDomain"
      :default-image-path="defaultImagePath"
      :article="article"
      :meta-info="metaInfo"
      :image-version="imageVersion"
      :key="'articlegrouped' + index"
      :preload-images="preloadImages"
      :canonical-url-structure="canonicalUrlStructure"
      v-for="(article, index) in wrapData.items"
    />
    <SiAdsWidgetLayout01 v-if="wrapData.show_dynamic_ad && wrapData.items.length > 0" :widget-data="adCode" />
  </div>
</template>

<script>
import ArticleTag from "~/components/common/ArticleTag";
export default {
  props: {
    componentId:Number,
    metaInfo: Object,
    wrapData: Object,
    applicationDomain: String,
    defaultImagePath: String,
    imageVersion: String,
    preloadImages: Boolean,
    canonicalUrlStructure: String,
    adCode:Object
  },
  components: {
    ArticleTag
  },
  name: "ArticleWrap"
};
</script>

<style></style>
