const clientConfig = require("./config");
// const { format, transports } = require("winston");
// const { combine, timestamp, prettyPrint } = format;
const winston = require("winston");
const cheerio = require("cheerio");
require("winston-daily-rotate-file");
const fileOptions = {
  filename: `./application-logs/error/error.log`,
  datePattern: "YYYY-MM-DD-HH",
  maxSize: "10m",
  maxFiles: "120"
};

if (process.env.NODE_ENV === "production") {
  fileOptions.level = "warn";
} else {
  fileOptions.level = "warn";
  // fileOptions.level = "info";
}

let transportsType = [new winston.transports.DailyRotateFile(fileOptions)];

export default {
  globalName: "myApp",
  server: {
    port: 80
  },
  loading: false,
  target: process.env.GENERATE ? "static" : "server",
  head: {
    htmlAttrs: {
      lang: "en"
    },
    meta: [],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
  },
  serverMiddleware: ["~/server-middleware/index.js"],
  css: [],
  plugins: ["~/plugins/axios"],
  components: [
    { path: "~/components/si-ads", global: true, prefix: "si-ads-" },
    { path: "~/components/si-head", global: true, prefix: "si-head-" },
    { path: "~/components/si-listing", global: true, prefix: "si-listing-" },
    { path: "~/components/si-menu", global: true, prefix: "si-menu-" },
    { path: "~/components/si-menu/mobile", global: true, prefix: "si-menu-mob-" },
    { path: "~/components/si-showcase", global: true, prefix: "si-showcase-" },
    { path: "~/components/si-scorestrip", global: true, prefix: "si-scorestrip-" },
    { path: "~/components/si-standings", global: true, prefix: "si-standings-" },
    { path: "~/components/si-videodetail", global: true, prefix: "si-videodetail-" },
    { path: "~/components/si-statsdetail", global: true, prefix: "si-statsdetail-" },
    { path: "~/components/si-statslisting", global: true, prefix: "si-statslisting-" },
    { path: "~/components/si-seriesarchives", global: true, prefix: "si-seriesarchives-" },
    { path: "~/components/si-fixtures", global: true, prefix: "si-fixtures-" },
    { path: "~/components/si-tracker", global: true, prefix: "si-tracker-" },
    { path: "~/components/si-login", global: true, prefix: "si-login-" },
    { path: "~/components/si-signup", global: true, prefix: "si-signup-" },
    { path: "~/components/si-profile", global: true, prefix: "si-profile-" },
    { path: "~/components/si-cricketscorecard", global: true, prefix: "si-cricketscorecard-" },
    { path: "~/components/si-footballscorecard", global: true, prefix: "si-footballscorecard-" },
    { path: "~/components/si-kabaddiscorecard", global: true, prefix: "si-kabaddiscorecard-" },
    { path: "~/components/si-breadcrumb", global: true, prefix: "si-breadcrumb-" },
    { path: "~/components/si-detail", global: true, prefix: "si-detail-" },
    { path: "~/components/si-tagcontentlisting", global: true, prefix: "si-tagcontentlisting-" },
    { path: "~/components/si-amp-head", global: true, prefix: "si-amp-head-" },
    { path: "~/components/si-amp-video", global: true, prefix: "si-ampvideo-" },
    { path: "~/components/si-amp", global: true, prefix: "si-amp-" },
    { path: "~/components/si-search", global: true, prefix: "si-search-" }
  ],

  buildModules: [],
  modules: ["@nuxtjs/axios", "nuxt-winston-log", "nuxt-user-agent"],
  axios: {},
  buildDir: `./dist/${clientConfig.CLIENT}/server-build`,
  build: {
    extend(config, { isDev, isClient }) {
      config.node = {
        fs: "empty",
        dns: "empty",
        net: "empty",
        tls: "empty"
      };
    }
  },
  hooks: {
    "render:route": (url, markup, context) => {
      if (url.indexOf("/amp") === 0) {
        const $ = cheerio.load(markup.html);
        $("style")
          .not("[amp-boilerplate]")
          .attr("amp-custom", "");
        $("body script").remove();
        // let gaCode = context.req.configData.cmsConfig.content.GAEnglishCode;
        let gtmAmpContainer = context.req.configData.cmsConfig.content.gtmampcontainer;
        let ampCanonicalUrl = "";
        $("head link").each(function(idx, el) {
          let relValue = $(el).attr("rel");
          if (relValue === "canonical") {
            ampCanonicalUrl = $(el).attr("href");
          }
        });
        // let a = `<amp-analytics type="gtag" data-credentials="include"><script type="application/json">
        //           {
        //               "vars" : {
        //                   "gtag_id": "${gaCode}",
        //                   "config" : {
        //                       "${gaCode}": { "groups": "default" }
        //                   }
        //               }
        //           }
        //         </script></amp-analytics>`;
        let a = `
        <amp-analytics config="https://www.googletagmanager.com/amp.json?id=${gtmAmpContainer}&gtm.url=${ampCanonicalUrl}" data-credentials="include"></amp-analytics>
        `;
        $("body").prepend($(a));
        return (markup.html = $.html());
      }
    }
  },
  privateRuntimeConfig: clientConfig,
  ssr: true,
  render: {
    injectScripts: false
  },
  winstonLog: {
    useDefaultLogger: false,
    skipRequestMiddlewareHandler: true,
    skipErrorMiddlewareHandler: true,
    loggerOptions: {
      // format: winston.format.simple(),
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: transportsType
    }
  }
};
