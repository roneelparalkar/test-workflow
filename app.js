"use strict";
const fs = require("fs");
const pjson = require("./package.json");
const app = require("express")();
const helmet = require("helmet");
const morgan = require("morgan");
const logger = require("./logger.js");
const { loadNuxt, build } = require("nuxt");
const apiRoutes = require("./routes").router;
const feedRoutes = require("./routes/feeds").router;
const cacheManager = require("./sdk/CacheManager/");
const Redis = require("./sdk/Redis");
const compression = require("compression");
const LRU = require("lru-cache");
const LRUOptions = {
  max: 10,
  length: function(n, key) {
    return n * 2 + key.length;
  }
};
const LRUCache = new LRU(LRUOptions);

const isDev = process.env.NODE_ENV === "development";
const port = process.env.PORT || 3000;

require("log-timestamp");
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(
  morgan(
    function(tokens, req, res) {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens["response-time"](req, res) + "ms",
        req.getPageInfoTime,
        req.cssAndWidgetApiTime
      ].join(" ");
    },
    {
      stream: logger.stream
    }
  )
);

if (!isDev) {
  app.use(compression());
}

async function startServer() {
  app.get("/ping", (req, res) => {
    res.send("pong-" + pjson.version);
  });
  app.use((req, res, next) => {
    req.configData = Redis.getConfig();
    req.Redis = Redis;
    next();
  });
  app.use((req, res, next) => {
    req.LRUCache = LRUCache;
    next();
  });

  app.use("/nuxt-api/", apiRoutes);
  if (process.env.NODE_ENV === "development") {
    app.use("/sifeeds/", feedRoutes);
  }

  const nuxt = await loadNuxt(isDev ? "dev" : "start");

  app.use(nuxt.render);

  if (isDev) {
    build(nuxt);
  }
  app.listen(port, () => {
    console.error(`Server listening on ${port}`);
  });
}

cacheManager.initCache(() => {
  startServer();
});
