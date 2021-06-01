const axios = require("axios");
const fs = require("fs");
const zlib = require("zlib");
const domain = "https://stg-sportsadda.sportz.io";
const configUrl = `${domain}/api/getclientinfo?clientcode=saw01`;
const Redis = require("./../../sdk/Redis");

const staticFileResponseHandler = (path, resp, type) => {
  let bufferedData = Buffer.from(resp);
  if (type === "css") {
    bufferedData = Buffer.from(resp.split("\n")[0]);
  }
  zlib.gzip(bufferedData, (err, gzippedResponse) => {
    if (err) {
      console.log(err, "---------err");
    } else {
      Redis.saveStaticFiles(path, gzippedResponse.toString("base64"));
    }
  });
};

axios.get(`${configUrl}`).then(resp => {
  resp.data.content.staticfiles.js = ["/static-assets/build/js/main.js"];
  resp.data.content.staticfiles.js.forEach(jsFile => {
    if (jsFile) {
      let api = `${domain}${jsFile}?v=${resp.data.content.jsversion}`;
      axios.get(api).then(resp => {
        if (resp) staticFileResponseHandler(jsFile, resp.data, "js");
      });
    }
  });
  resp.data.content.staticfiles.css.forEach((cssFile, i) => {
    // if (i === 0) {
    if (cssFile) {
      let api = `${domain}${cssFile}?v=${resp.data.content.cssversion}`;
      axios.get(api).then(resp => {
        if (resp) staticFileResponseHandler(cssFile, resp.data, "css");
      });
    }
    // }
  });
});

// let cssData = fs.readFileSync("./test.css", "utf8");

// zlib.gzip(Buffer.from(cssData), (err, resp) => {
//   console.log(err, "---------err");
//   console.log(resp.toString("base64"), "---------resp");
// });
