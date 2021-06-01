<template>
  <motm-component v-if="widgetData && widgetData.isMotm" />
  <div v-else-if="widgetData && !widgetData.isMotm" :class="widgetData.extraClass" v-html="widgetData.adCode"></div>
</template>

<script>
import Vue from "vue";
import { getTeamFlag } from "~/sdk/WidgetLibrary/utils";
export default {
  props: {
    widgetData: Object,
    translations: Object,
    imagePaths: Object,
    winstonLogger: Object,
    selectedLanguage: String,
    configData: Object,
    globalData: Object,
  },
  head() {
    let scripts = [];
    if (this.widgetData && this.widgetData.parsedMarkup) {
      scripts = [
        {
          innerHTML: `window.markup=\`${this.widgetData.parsedMarkup}\``,
          type: "text/javascript",
          charset: "UTF-8",
          body: true,
        },
        {
          innerHTML: `window.defaultImg=\`${this.getDefaultImg()}\``,
          type: "text/javascript",
          charset: "UTF-8",
          body: true,
        },
        {
          innerHTML: `window.selector='${this.widgetData.selector}'`,
          type: "application/javascript",
          body: true,
          async: true,
        },
        {
          innerHTML: `window.isMobile=${this.widgetData.isMobile}`,
          type: "application/javascript",
          body: true,
          async: true,
        },
      ];
      return {
        __dangerouslyDisableSanitizers: ["script"],
        script: scripts,
      };
    }
    return {};
  },
  data() {
    if (this.widgetData.isMotm) {
      let vueData = this.widgetData.pollData;
      let self = this;
      Vue.component("motm-component", {
        template: this.widgetData.adCode,
        data() {
          return vueData;
        },
        computed: {},
        methods: {
          getTeamName(key) {
            return this.pollData[0].pollDescParsed[key];
          },
          getTeamFlag: function (teamId) {
            return getTeamFlag(self.winstonLogger, self.widgetData.imagePaths, {}, 1, teamId);
          },
          focususername() {
            if (this.prfoileData && this.prfoileData.sportsbet_username == "") {
              this.disableBtn = true;
            } else {
              this.disableBtn = false;
            }
          },
        },
      });
    }
    return {};
  },
  methods: {
    getDefaultImg() {
      if (this.configData.content.defaultProfileImage) {
        return this.configData.content.defaultProfileImage + "?v=" + this.configData.content.playerImg;
      } else {
        return "";
      }
    },
  },
};
</script>
