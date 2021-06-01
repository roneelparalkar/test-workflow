const zlib = require("zlib");
const fs = require("fs");
const redis = require("./../../sdk/Redis");

// async function start() {
//   let data = await redis.getCssData("/static-assets/build/css/widgets/si-fixtures/widget_layout_01.css");
//   // let data = fs.readFileSync("./test.txt", "utf8");
//   let buf = Buffer.from(data, "base64");

//   zlib.gunzip(buf, (err, respData) => {
//     // console.log(err, "=================err================");
//     // console.log(respData, "------respDa---------------");
//     console.log(respData.toString("utf8"));
//   });
// }
// start();

let link = "/static-assets/build/css/core.css";
let data = fs.readFileSync("./test.txt", "utf8");
// console.log(data);
setTimeout(() => {
  redis.saveStaticFiles(link, data);
}, 3000);
