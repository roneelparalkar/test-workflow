<template>
  <div v-if="!widgetData.err" class="waf-component waf-breadcrumb widget-layout-01">
    <div class="layout-wrapper">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li v-for="(obj, i) in widgetData.breadCrumbArray" :key="i" class="breadcrumb-item">
            <a v-if="i !== widgetData.breadCrumbArray.length - 1" :href="getHref(obj.alias, i)">
              <span>{{ obj.title }}</span>
            </a>
            <span v-else-if="isCustomTitlePage() && globalData && globalData.customTitle">{{ globalData.customTitle }}</span>
            <span v-else>{{ obj.title }}</span>
          </li>
        </ol>
      </nav>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    widgetData: Object,
    winstonLogger: Object,
    globalData: Object
  },
  head() {
    try {
      if (this.widgetData.err) return {};
      let itemListElement = [];
      if (this.widgetData.breadCrumbArray)
        this.widgetData.breadCrumbArray.map((o, index) => {
          let lastIndex = this.widgetData.breadCrumbArray.length - 1;
          let { alias, level, title } = o;
          let obj = {
            "@type": "ListItem",
            position: level + 1,
            item: {}
          };
          if (index === lastIndex) {
            if (this.isCustomTitlePage() && this.globalData && this.globalData.customCanonicalUrl && this.globalData.customTitle) {
              obj.item["@id"] = this.globalData.customCanonicalUrl;
              obj.item.name = this.globalData.customTitle;
            } else {
              obj.item["@id"] = this.getHref(alias, index);
              obj.item.name = title;
            }
          } else {
            obj.item["@id"] = this.getHref(alias, index);
            obj.item.name = title;
          }
          itemListElement.push(obj);
        });

      let headObj = {
        __dangerouslyDisableSanitizers: ["script"],
        script: [
          {
            innerHTML: `{
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": ${JSON.stringify(itemListElement)}
            }`,
            type: "application/ld+json"
          }
        ]
      };
      return headObj;
    } catch (e) {
      this.winstonLogger.error({ location: "si-breadcrumb-saw01", name: e.name, message: e.message });
      return {};
    }
  },
  methods: {
    isCustomTitlePage() {
      return (
        this.widgetData.assetTypeId == 1 ||
        this.widgetData.assetTypeId == 2 ||
        this.widgetData.assetTypeId == 4 ||
        this.widgetData.assetTypeId == 29 ||
        this.widgetData.isRegex
      );
    },
    getHref: function(value, index) {
      if (value === "") {
        return this.widgetData.applicationDomain;
      } else {
        let domain = this.widgetData.applicationDomain;
        domain += "/" + value;
        return domain.toLowerCase();
      }
    }
  }
};
</script>
