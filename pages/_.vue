<template>
  <body-component />
</template>

<script>
import Vue from "vue";
import { mainParser } from "~/sdk/apiDataParser";

export default {
  head() {
    return this.headObj;
  },
  async asyncData(context) {
    try {
      const fullPageData = await mainParser(context);
      if (
        fullPageData &&
        fullPageData.bodyMarkup &&
        fullPageData.pageInfo &&
        fullPageData.pageInfo.content &&
        fullPageData.pageInfo.content.status_code
      ) {
        context.res.statusCode = +fullPageData.pageInfo.content.status_code;
        Vue.component("body-component", {
          template: fullPageData.bodyMarkup,
          data() {
            return { fullPageData };
          }
        });
        return fullPageData;
      } else {
        context.$config.cmsConfig = context.req.configData.cmsConfig;
        context.error({
          statusCode: 404,
          message: "Post not found",
          isMobile: context.req.isMobile
        });
      }
    } catch (e) {
      console.log("ERROR ================", e);
    }
  }
};
</script>
