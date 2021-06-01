<template>
  <motm-component />
</template>
<script>
import Vue from "vue";
import { getTeamFlag } from "~/sdk/WidgetLibrary/utils";

export default {
  props: {
    widgetData: Object
  },
  head() {
    return {
      __dangerouslyDisableSanitizers: ["script"],
      script: [
        {
          innerHTML: `window.motmMarkup='${this.widgetData.parsedMarkup}'`,
          type: "text/javascript",
          charset: "UTF-8",
          body: true
        },
        {
          innerHTML: `window.selector='${this.widgetData.selector}'`,
          type: "application/javascript",
          body: true,
          async: true
        },
        {
          innerHTML: `window.isMobile=${this.widgetData.isMobile}`,
          type: "application/javascript",
          body: true,
          async: true
        },
        {
          src: `/static-assets/build/js/motm.js`,
          type: "application/javascript",
          body: true,
          async: true
        }
      ]
    };
  },
  data() {
    let vueData = this.widgetData.pollData;
    Vue.component("motm-component", {
      template: this.widgetData.adCode,
      data() {
        return vueData;
      },
      computed() {},
      methods: {
        getTeamName(key) {
          return this.pollData[0].pollDescParsed[key];
        },
        getTeamFlag: function(teamId, size) {
          return getTeamFlag(this.winstonLogger, this.imagePaths, {}, teamId);
        }
      }
    });
    return {};
  }
};
</script>
