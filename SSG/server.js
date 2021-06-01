"use strict";
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
require("log-timestamp");
const PORT = process.env.PORT || 8888;
const app = express();
global.CONFIG = require("./constants");
const indexRouter = require("./app/routes").router;
const generator = require("./app/model/generatorModel");
let settings = require("./settings");
let counter = 0;
let generationInProgress = false;

let sess = {
  secret: "randomsecret",
  saveUninitialized: true,
  resave: true
};
app.use(session(sess));
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.get("/ping", (req, res) => res.end("pong"));
// app.use("/", express.static(__dirname));
app.use("/api/", indexRouter);
app.use("/", express.static("./public"));

// setInterval(() => {
//   if (generationInProgress) {
//     return;
//   }
//   counter += 1;
//   const settingsConfiguration = settings.getConfig();
//   const interval = settingsConfiguration.interval;
//   if (!(counter % interval)) {
//     counter = 0;
//     generationInProgress = true;
//     console.time("GEN TIME");
//     generator.build(() => {
//       generationInProgress = false;
//       console.timeEnd("GEN TIME");
//     });
//   }
// }, 60 * 1000);

app.listen(PORT, () => {
  console.log("App listening on", PORT);
});
