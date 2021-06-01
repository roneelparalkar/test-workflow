const path = require("path");
const fs = require("fs");
const gulp = require("gulp");
const replace = require("gulp-string-replace");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
// const uglify = require("gulp-uglify-es").default;
// const browserify = require("browserify");
// const source = require("vinyl-source-stream");
// const buffer = require("vinyl-buffer");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const ShakePlugin = require("webpack-common-shake").Plugin;
const _ = require("lodash");
const importFresh = require("import-fresh");
const config = require("./gulpConfig.js");
let client = process.argv[2] ? process.argv[2].replace("--client=", "") : "";
let environment =
  process.env.NODE_ENV && ["development", "beta", "production", "web", "mob"].includes(process.env.NODE_ENV) ? process.env.NODE_ENV : "";

gulp.task("invalidClient", () => {
  return new Promise(resolve => {
    console.log("======Invalid OR No client specified======");
    resolve();
  });
});

gulp.task("environmentInvalid", () => {
  return new Promise(resolve => {
    console.log("======Invalid OR No environment specified======");
    resolve();
  });
});

gulp.task("buildInit", () => {
  let clientPath = `./clients/${client}/`;
  let jsFile = `${clientPath}js/init.js`;
  return new Promise(resolve => {
    let webpackConfig = {
      entry: jsFile,
      output: {
        path: path.resolve(__dirname, "static", `static-assets`, "build", "js"),
        filename: jsFile.split("/").pop()
      },
      mode: "production",
      plugins: [new ShakePlugin()],
      optimization: { usedExports: true, sideEffects: false }
    };
    gulp
      .src([jsFile])
      .pipe(webpackStream(webpackConfig), webpack)
      .pipe(gulp.dest(`./static/static-assets/build/js/`))
      .pipe(gulp.dest(`./dist/${client}/client-build/`));
    resolve();
  });
});

gulp.task("buildLocalClientConfig", () => {
  return new Promise(resolve => {
    // let mainConfig = importFresh(`./sdk/WidgetLibrary/serverWidgetConfig.json`);
    // Object.keys(mainConfig.widgets).forEach(key => {
    //   let node = mainConfig.widgets[key];
    //   delete node.preParser;
    //   delete node.postParser;
    //   delete node.markupFile;
    // });
    let clientConfig = importFresh(`./clients/${client}/js/localClientConfig`);
    // const clientWidgetsData = _.merge(mainConfig, clientAdditionalConfig);
    fs.writeFileSync(`./static/static-assets/build/js/localClientConfig.json`, JSON.stringify(clientConfig));
    // const clientBuildPath = `./dist/${client}/client-build/`;
    // if (fs.existsSync(clientBuildPath)) {
    //   fs.writeFileSync(`./dist/${client}/client-build/localClientConfig.json`, JSON.stringify(clientConfig));
    //   resolve();
    // } else {
    // fs.mkdir(clientBuildPath, () => {
    //   fs.writeFileSync(`./dist/${client}/client-build/localClientConfig.json`, JSON.stringify(clientConfig));
    resolve();
    // });
    // }
  });
});

gulp.task("buildClientConfig", () => {
  return new Promise(resolve => {
    // let mainConfig = importFresh(`./sdk/WidgetLibrary/serverWidgetConfig`);
    // Object.keys(mainConfig.widgets).forEach(key => {
    //   let node = mainConfig.widgets[key];
    //   delete node.preParser;
    //   delete node.postParser;
    //   delete node.markupFile;
    // });
    let clientAdditionalConfig = importFresh(`./clients/${client}/js/widgetConfig`);
    // const clientWidgetsData = _.merge(mainConfig, clientAdditionalConfig);
    fs.writeFileSync(`./static/static-assets/build/js/clientConfig.json`, JSON.stringify(clientAdditionalConfig));
    fs.mkdir(`./dist/${client}/client-build/`, () => {
      fs.writeFileSync(`./dist/${client}/client-build/clientConfig.json`, JSON.stringify(clientAdditionalConfig));
      resolve();
    });
  });
});

gulp.task("buildWidgetJs", () => {
  return new Promise(resolve => {
    if (!config[client].length) {
      resolve();
    } else {
      config[client].forEach((configData, index) => {
        // let replaceOptions = { logs: { enabled: false } };
        // let markup = configData.markupFile ? fs.readFileSync(configData.markupFile, "utf8") : "";

        let webpackConfig = {
          entry: configData.jsFile,
          output: {
            path: path.resolve(__dirname, "static", `static-assets`, "build", "js"),
            filename: configData.jsFile.split("/").pop()
          },
          mode: "production",
          plugins: [new ShakePlugin(), new VueLoaderPlugin()],
          optimization: { usedExports: true, sideEffects: false },
          module: {
            rules: [
              {
                test: /\.vue$/,
                loader: "vue-loader"
              },
              {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
              }
            ]
          }
        };
        gulp
          .src([configData.jsFile])
          .pipe(webpackStream(webpackConfig), webpack)
          .pipe(gulp.dest(configData.dest))
          .pipe(gulp.dest(`./dist/${client}/client-build/`));
        if (index === config[client].length - 1) {
          resolve();
        }
      });
    }
  });
});

gulp.task("writeServerConfig", () => {
  return new Promise(resolve => {
    writeConfig();
    resolve();
  });
});

gulp.task("buildWebsite", () => {
  return new Promise(resolve => {
    fs.readdir(`./clients/${client}/js/website/`, function(err, filenames) {
      // return resolve();
      if (err) {
        return;
      }
      filenames.forEach(function(filename) {
        if (filename.split(".").pop() === "js") {
          let webpackConfig = {
            entry: `./clients/${client}/js/website/${filename}`,
            output: {
              path: path.resolve(__dirname, "static", `static-assets`, "build", "js"),
              filename
            },
            mode: "production",
            plugins: [new ShakePlugin()],
            optimization: { usedExports: true, sideEffects: false },
            module: {
              rules: [
                {
                  test: /\.css$/,
                  use: ["style-loader", "css-loader"]
                }
              ]
            }
          };
          gulp
            .src([`./clients/${client}/js/website/${filename}`])
            .pipe(webpackStream(webpackConfig), webpack)
            .pipe(gulp.dest(`./static/static-assets/build/js/`))
            .pipe(gulp.dest(`./dist/${client}/client-build/`));
          resolve();
        }
      });
    });
  });
});

gulp.task("buildMain", () => {
  return new Promise(resolve => {
    let filename = process.env.NODE_ENV + "-main.js";
    let webpackConfig = {
      entry: `./clients/${client}/js/website/main.js`,
      output: {
        path: path.resolve(__dirname, "static", `static-assets`, "build", "js"),
        filename
      },
      mode: "production",
      plugins: [new ShakePlugin()],
      optimization: { usedExports: true, sideEffects: false },
      module: {}
    };
    gulp
      .src([`./clients/${client}/js/website/main.js`])
      .pipe(webpackStream(webpackConfig), webpack)
      .pipe(gulp.dest(`./static/static-assets/build/js/`))
      .pipe(gulp.dest(`./dist/${client}/client-build/`));
    resolve();
  });
});

gulp.task("watchChanges", () => {
  gulp.watch(`./components/**/*.vue`, gulp.series("buildWidgetJs"));
  gulp.watch(`./clients/${client}/js/*.js`, gulp.series("buildWidgetJs"));
  gulp.watch(`./sdk/WidgetLibrary/utils.js`, gulp.series("buildWidgetJs"));
  gulp.watch(`./sdk/WidgetLibrary/clientServerCommon.js`, gulp.series("buildWidgetJs"));
  gulp.watch(`./sdk/model/componentTypeParser.js`, gulp.series("buildWidgetJs"));

  gulp.watch(`./clients/${client}/js/localClientConfig.json`, gulp.series("buildLocalClientConfig"));

  gulp.watch(`./clients/${client}/js/widgetConfig.json`, gulp.series("buildClientConfig"));

  gulp.watch(`./clients/${client}/config/**/*.js`, gulp.series("writeServerConfig"));

  gulp.watch(`./clients/${client}/js/init.js`, gulp.series("buildInit"));
  gulp.watch(`./clients/${client}/js/website/*`, gulp.series("buildWebsite"));
  gulp.watch(`./sdk/model/componentTypeParser.js`, gulp.series("buildWebsite"));
});

if (!client) {
  gulp.task("default", gulp.series(["invalidClient"]));
} else if (!environment) {
  gulp.task("default", gulp.series(["environmentInvalid"]));
} else if (environment === "mobile") {
  gulp.task("default", gulp.series(["buildMain"]));
} else if (environment === "web") {
  gulp.task("default", gulp.series(["buildMain"]));
} else {
  gulp.task(
    "default",
    gulp.series(["buildLocalClientConfig", "buildClientConfig", "buildInit", "buildWidgetJs", "writeServerConfig", "buildWebsite", "watchChanges"])
  );
}

function writeConfig() {
  let clientConfig = importFresh(`./clients/${client}/config`);
  fs.writeFileSync("./config.json", JSON.stringify(clientConfig, null, 2));
}
