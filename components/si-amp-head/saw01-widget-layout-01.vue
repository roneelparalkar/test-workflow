<template>
  <!--Mandatory required boiler plate CSS-->
  <div></div>
</template>

<script>
export default {
  props: {
    widgetData: Object,
    winstonLogger: Object,
    configData: Object,
    globalData:Object
  },
  head() {
    let metaInfoArray = [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5, shrink-to-fit=no" },
      { name: "description", content: this.globalData && this.globalData.customPageDescription ? this.globalData.customPageDescription : this.widgetData.pageDescription },
      { property: "og:site_name", content: this.configData.content.client_display_name },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@sportsadda_" },
      { name: "twitter:creator", content: "@sportsadda_" },
      { name: "twitter:title", content: this.globalData && this.globalData.customTitle ? this.globalData.customTitle : this.widgetData.browserTitle },
      { name: "twitter:description", content: this.globalData && this.globalData.customPageDescription ? this.globalData.customPageDescription : this.widgetData.pageDescription },
      { name: "twitter:url", content: this.widgetData.ampCanonicalUrl },
      { name: "twitter:image", content: this.widgetData.featuredImagePath },
      { property: "og:title", content: this.globalData && this.globalData.customTitle ? this.globalData.customTitle : this.widgetData.browserTitle },
      { property: "og:description", content: this.globalData && this.globalData.customPageDescription ? this.globalData.customPageDescription : this.widgetData.pageDescription },
      { property: "og:url", content: this.widgetData.ampCanonicalUrl },
      { property: "og:image", content: this.widgetData.featuredImagePath },
      { property: "og:image:secure_url", content: this.widgetData.featuredImagePath },
      { property: "og:image:alt", content: this.globalData && this.globalData.customPageDescription ? this.globalData.customPageDescription : this.widgetData.pageDescription },
      { property: "og:image:width", content: "1200px" },
      { property: "og:image:height", content: "1200px" },
    ];
    let newMeta1 = [];
    if ([1, 2, 3, 4, 29].includes(this.widgetData.assetTypeId)) {
      newMeta1 = [
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: this.widgetData.articlePublishedDate },
        { property: "article:modified_time", content: this.widgetData.articleModifiedDate },
      ];
      metaInfoArray = metaInfoArray.concat(newMeta1);
    } else {
      newMeta1 = [{ property: "og:type", content: "website" }];
      metaInfoArray = metaInfoArray.concat(newMeta1);
    }
    return {
      __dangerouslyDisableSanitizers: ["script", "noscript"],
      title: this.globalData && this.globalData.customTitle ? this.globalData.customTitle : this.widgetData.title,
      script: [
        {
          innerHTML: `
              
              {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "${this.configData.content.ClientNameTitle}",
        "legalName": "${this.configData.content.ClientNameTitle}",
        "url": "https://www.sportsadda.com",
        "logo": "https://www.sportsadda.com/static-assets/images/logo.png",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "T1-5F-3C RAKEZ Amenity Center",
            "addressLocality": "Al Hamra Industrial Zone-FZ RAK",
            "addressRegion": "United Arab Emirates"
        },
        "sameAs": [
            "https://www.facebook.com/SportsAddaOfficial/",
            "https://twitter.com/sportsadda_",
            "https://www.instagram.com/sportsaddaofficial/",
            "https://www.youtube.com/channel/UCqJPjpJcnjJpGJDx5NOddQw"
            ]
        }
            `,
          type: "application/ld+json",
        },
        {
          src: `https://cdn.ampproject.org/v0.js`,
          async: true,
        },
        {
          src: `https://cdn.ampproject.org/v0/amp-ad-0.1.js`,
          async: true,
          "custom-element": "amp-ad",
        },
        {
          src: `https://cdn.ampproject.org/v0/amp-social-share-0.1.js`,
          async: true,
          "custom-element": "amp-social-share",
        },
        {
          src: `https://cdn.ampproject.org/v0/amp-iframe-0.1.js`,
          async: true,
          "custom-element": "amp-iframe",
        },
        {
          src: `https://cdn.ampproject.org/v0/amp-analytics-0.1.js`,
          async: true,
          "custom-element": "amp-analytics",
        },
        {
          src: `https://cdn.ampproject.org/v0/amp-youtube-0.1.js`,
          async: true,
          "custom-element": "amp-youtube",
        },
        {
          src: `https://cdn.ampproject.org/v0/amp-twitter-0.1.js`,
          async: true,
          "custom-element": "amp-twitter",
        },
        {
          src: `https://cdn.ampproject.org/v0/amp-instagram-0.1.js`,
          async: true,
          "custom-element": "amp-instagram",
        },
        {
          src: `https://cdn.ampproject.org/v0/amp-facebook-0.1.js`,
          async: true,
          "custom-element": "amp-facebook",
        }
      ],
      meta: metaInfoArray,
      link: [{ rel: "canonical", href: this.widgetData.ampCanonicalUrl }],
      style: [
        {
          cssText: `body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`,
          "amp-boilerplate": true,
        },
      ],
      noscript: [
        {
          innerHTML: `<style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style>`,
        },
      ],
     
    };
  },
};
</script>