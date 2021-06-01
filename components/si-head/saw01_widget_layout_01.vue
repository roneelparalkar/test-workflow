<template> </template>

<script>
export default {
  props: {
    widgetData: Object,
    winstonLogger: Object,
    configData: Object,
    isBot: Boolean,
    globalData: Object
  },
  head() {
    if (this.widgetData.err) {
      return;
    }
    try {
      let headData = {
        __dangerouslyDisableSanitizers: ["script"],
        title: this.globalData && this.globalData.customTitle ? this.globalData.customTitle : this.widgetData.title,
        script: [
          {
            innerHTML: `
              window.contentImgVersion = ${this.configData.content.imgversion},
              window.imgVersion = ${this.configData.content.playerImg},
              window.cssVersion = ${this.configData.content.cssversion},
              window.jsVersion = "${this.configData.content.jsversion}",
              window.feedVersion = "${this.configData.content.feedversion}",
              window.page_has_data_widget = ${this.widgetData.hasDataWidget},
              window.fbAppId = ${this.configData.content.fbapp_id},
              window.googletag = window.googletag || {cmd: []};
            `,
            type: "application/javascript",
            charset: "utf-8"
          },
          // {
          //   innerHTML: `
          //     window.dataLayer = window.dataLayer || [];
          //     function gtag(){dataLayer.push(arguments);}
          //     gtag('js', new Date());

          //     gtag('config', "${this.configData.content.GAEnglishCode}");
          //   `,
          //   type: "text/javascript",
          //   charset: "utf-8"
          // },
          {
            innerHTML: `
               var gaTrigger = false;
                window.addEventListener("mousemove", function(){ loadGA(); });
                window.addEventListener("scroll", function(){ loadGA(); });
                window.addEventListener("click", function(){ loadGA(); });
                var gaId = '${this.configData.content.GAEnglishCode}';
                window.dataLayer = window.dataLayer || [];
                function gtag() {
                  dataLayer.push(arguments);
                }
                gtag('js', new Date());
                gtag('config', gaId, {
                  send_page_view: false
                });
                function loadGA(event) {
                  if (gaTrigger) {
                    return;
                  }
                  gaTrigger = true;
                  var gaScript = document.createElement('script');
                  gaScript.src = "https://www.googletagmanager.com/gtag/js?id=" + gaId;
                  gaScript.async = true;
                  document.getElementsByTagName('head')[0].appendChild(gaScript);
                }
                document.addEventListener("DOMContentLoaded", () => {
                  setTimeout(()=>{
                      loadGA()
                  },3000)                
                });
            `
          },
          {
            innerHTML: `
              var gtmTriggered = false;
              document.addEventListener('mousemove', function(){ loadTagManager(); });
              document.addEventListener('scroll', function(){ loadTagManager(); });
              function loadTagManager(){
                  if(gtmTriggered){
                      return;
                  }
                  gtmTriggered = true;
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer',"${this.configData.content.gtmcontainer}");
              }
              document.addEventListener("DOMContentLoaded", () => {
                setTimeout(()=>{
                    loadTagManager()
                },3000)                
              });
            `,
            type: "text/javascript",
            charset: "utf-8"
          },
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
            type: "application/ld+json"
          },
          {
            innerHTML: `
              {
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  "url": "https://www.sportsadda.com/",
                  "potentialAction": {
                      "@type": "SearchAction",
                      "target": "https://www.sportsadda.com/search?q={search_term_string}",
                      "query-input": "required name=search_term_string"
                  }
              }
            `,
            type: "application/ld+json"
          }
        ],
        link: [
          { rel: "preconnect", href: "//www.googletagmanager.com" },
          { rel: "preconnect", href: "//cdnjs.cloudflare.com" },
          { rel: "preconnect", href: "//connect.facebook.net" },
          { rel: "dns-prefetch", href: "//www.gstatic.com" },
          { rel: "dns-prefetch", href: "//www.googletagservices.com" },
          { rel: "dns-prefetch", href: "//cdnjs.cloudflare.com" },
          { rel: "dns-prefetch", href: "//asia.adform.net" },
          { rel: "dns-prefetch", href: "//s2.adform.net" },
          { rel: "dns-prefetch", href: "//appleid.cdn-apple.com" },
          { rel: "dns-prefetch", href: "//connect.facebook.net" },
          { rel: "dns-prefetch", href: "//www.facebook.com" },
          { rel: "dns-prefetch", href: "//staticxx.facebook.com" },
          { rel: "dns-prefetch", href: "//fonts.gstatic.com" },
          { rel: "dns-prefetch", href: "//fonts.googleapis.com" },
          { rel: "dns-prefetch", href: "//tpc.googlesyndication.com" },
          { rel: "dns-prefetch", href: "//www.google-analytics.com" },
          { rel: "dns-prefetch", href: "//securepubads.g.doubleclick.net" },
          { rel: "dns-prefetch", href: "//sc-static.net" },
          { rel: "dns-prefetch", href: "//platform.twitter.com" },
          { rel: "dns-prefetch", href: "//platform.instagram.com" },
          { rel: "dns-prefetch", href: "//www.instagram.com" },
          { rel: "apple-touch-icon", sizes: "180x180", href: "/static-assets/favicons/apple-touch-icon.png" },
          { rel: "icon", type: "image/png", sizes: "32x32", href: "/static-assets/favicons/favicon-32x32.png" },
          { rel: "icon", type: "image/png", sizes: "16x16", href: "/static-assets/favicons/favicon-16x16.png" },
          { rel: "mask-icon", href: "/static-assets/favicons/safari-pinned-tab.svg", color: "#5bbad5" },
          { rel: "shortcut icon", href: "/static-assets/favicons/favicon.ico" },
          {
            rel: "canonical",
            href: this.globalData && this.globalData.customCanonicalUrl ? this.globalData.customCanonicalUrl : this.widgetData.canonicalUrl
          }
          // { rel: "manifest", href: "/static-assets/favicons/site.webmanifest" },
          // { rel: "preload", as: "style", href: "/static-assets/build/css/core.css" },
          // { rel: "stylesheet", href: "/static-assets/build/css/core.css", onload: "this.media='all'", media: "print" },
        ],
        meta: [
          { charset: "utf-8" },
          { "http-equiv": "x-ua-compatible", content: "ie=edge" },
          { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5, shrink-to-fit=no" },
          { name: "msapplication-TileColor", content: "#ffffff" },
          { name: "msapplication-config", content: "/static-assets/favicons/browserconfig.xml" },
          { name: "theme-color", content: "#ffffff" },
          { property: "fb:pages", content: this.configData.content.fbpages },
          { property: "fb:app_id", content: this.configData.content.fbapp_id },
          { name: "apple-itunes-app", content: "app-id=1465629990" },
          {
            name: "description",
            content:
              this.globalData && this.globalData.customPageDescription ? this.globalData.customPageDescription : this.widgetData.pageDescription
          },
          { property: "og:site_name", content: this.configData.content.client_display_name },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:site", content: "@sportsadda_" },
          { name: "twitter:creator", content: "@sportsadda_" },
          { name: "twitter:title", content: this.globalData && this.globalData.customTitle ? this.globalData.customTitle : this.widgetData.title },
          {
            name: "twitter:description",
            content:
              this.globalData && this.globalData.customPageDescription ? this.globalData.customPageDescription : this.widgetData.pageDescription
          },
          {
            name: "twitter:url",
            content: this.globalData && this.globalData.customCanonicalUrl ? this.globalData.customCanonicalUrl : this.widgetData.canonicalUrl
          },
          { name: "twitter:image", content: this.widgetData.featuredImagePath },
          { property: "og:type", content: "website" },
          { property: "og:title", content: this.globalData && this.globalData.customTitle ? this.globalData.customTitle : this.widgetData.title },
          {
            property: "og:description",
            content:
              this.globalData && this.globalData.customPageDescription ? this.globalData.customPageDescription : this.widgetData.pageDescription
          },
          {
            property: "og:url",
            content: this.globalData && this.globalData.customCanonicalUrl ? this.globalData.customCanonicalUrl : this.widgetData.canonicalUrl
          },
          {
            property: "og:image:alt",
            content:
              this.globalData && this.globalData.customPageDescription ? this.globalData.customPageDescription : this.widgetData.pageDescription
          },
          { property: "og:image:width", content: "1200px" },
          { property: "og:image:height", content: "1200px" },
          { property: "og:image", content: this.widgetData.featuredImagePath },
          { property: "og:image:secure_url", content: this.widgetData.featuredImagePath }
        ]
      };

      if (process.env.NODE_ENV === "development") {
        headData.link.push({ rel: "stylesheet", href: "/static-assets/build/css/matchcentre.css" });
        headData.link.push({
          rel: "stylesheet",
          href: "/static-assets/build/css/widgets/si-cricketscorecard/widget_layout_01.css"
        });
        headData.link.push({
          rel: "stylesheet",
          href: "/static-assets/build/css/widgets/si-footballscorecard/widget_layout_01.css"
        });
        headData.link.push({
          rel: "stylesheet",
          href: "/static-assets/build/css/widgets/si-kabaddiscorecard/widget_layout_01.css"
        });
      }

      if ([1, 2, 4].includes(this.widgetData.assetTypeId)) {
        if (this.widgetData.ampCanonicalUrl) {
          headData.meta.push({ rel: "amphtml", href: this.widgetData.ampCanonicalUrl });
        }
      }

      // if ([1, 2, 4, 29].includes(this.widgetData.assetTypeId)) {
      //   let newMeta1 = [
      //     { property: "og:type", content: "website" },
      //     { property: "og:title", content: this.globalData && this.globalData.customTitle ? this.globalData.customTitle : this.widgetData.title },
      //     { property: "og:description", content: this.globalData && this.globalData.customPageDescription ? this.globalData.customPageDescription : this.widgetData.pageDescription },
      //     {
      //       property: "og:url",
      //       content: this.globalData && this.globalData.customCanonicalUrl ? this.globalData.customCanonicalUrl : this.widgetData.canonicalUrl
      //     },
      //     { property: "og:image:alt", content: this.globalData && this.globalData.customPageDescription ? this.globalData.customPageDescription : this.widgetData.pageDescription},
      //     { property: "og:image:width", content: "1200px" },
      //     { property: "og:image:height", content: "1200px" }
      //   ];
      //   headData.meta = headData.meta.concat(newMeta1);
      // } else {
      //   let newMeta1 = [
      //     { property: "og:type", content: "website" },
      //     { property: "og:image", content: this.configData.content.ApplicationDomain + this.configData.content.defaultImagePath },
      //     { property: "og:image:secure_url", content: this.configData.content.ApplicationDomain + this.configData.content.defaultImagePath }
      //   ];
      //   headData.meta = headData.meta.concat(newMeta1);
      // }
      if ([1, 2, 3, 4, 29].includes(this.widgetData.assetTypeId)) {
        if (this.widgetData.articlePublishedDate) {
          headData.meta.push({ property: "article:published_time", content: this.widgetData.articlePublishedDate });
        }
        if (this.widgetData.articleModifiedDate) {
          headData.meta.push({ property: "article:modified_time", content: this.widgetData.articleModifiedDate });
        }
      }
      if (this.widgetData.isMobile) {
        let mobileMeta = [
          {
            property: "al:ios:url",
            content: this.globalData && this.globalData.customCanonicalUrl ? this.globalData.customCanonicalUrl : this.widgetData.canonicalUrl
          },
          { property: "al:ios:app_store_id", content: "1465629990" },
          { property: "al:ios:app_name", content: this.configData.content.client_display_name },
          {
            property: "al:android:url",
            content: this.globalData && this.globalData.customCanonicalUrl ? this.globalData.customCanonicalUrl : this.widgetData.canonicalUrl
          },
          { property: "al:android:package", content: "com.stumped.app" },
          { property: "al:android:app_name", content: this.configData.content.client_display_name }
        ];
        headData.meta = headData.meta.concat(mobileMeta);
      }

      if (this.isBot) {
        delete headData.script;
        delete headData.link;
      }

      return headData;
    } catch (e) {
      this.winstonLogger.error({ location: "si-head-saw01", name: e.name, message: e.message });
      return {};
    }
  }
};
</script>
