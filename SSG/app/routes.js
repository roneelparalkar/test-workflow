"use strict";
const fs = require("fs");
const express = require("express");
const router = express.Router();
const request = require("request");
const { checkEntityHeader, checkLogin } = require("./middleware/auth");
const users = global.CONFIG.USERS;
const settings = require("./../settings");
const helper = require("./model/helper");
const { response } = require("express");

router.get("/check-login", (req, res) => {
  res.json({ status: "success" });
});

router.get("/getpageinfo", (req, res) => {
  //LANDING PAGES
  // let resp = require("./json-data/homePageGetPageInfo.json");
  // let resp = require("./json-data/bblPageGetPageInfo.json");
  // let resp = require("./json-data/iplPageGetPageInfo.json");
  // let resp = require("./json-data/opinionsPageGetPageInfo.json");
  // let resp = require("./json-data/kabaddiPageGetPageInfo.json");
  // let resp = require("./json-data/featuresPageGetPageInfo.json");
  // let resp = require("./json-data/tipsAndPredictionsGetPageInfo.json");
  // let resp = require("./json-data/footballEplGetPageInfo.json");

  // FIXTURE PAGES
  // let resp = require("./json-data/cricketScoreGetPageInfo.json");
  // let resp = require("./json-data/ecnCricketScoreGetPageInfo.json");
  // let resp = require("./json-data/cricketScoreGetPageInfoTeam.json");
  // let resp = require("./json-data/cricketScoreGetPageInfoTournament.json");
  // let resp = require("./json-data/seriesFixtureGetPageInfo.json");
  // let resp = require("./json-data/bblScorePageGetPageInfo.json");
  // let resp = require("./json-data/cricketTourPageScoreGetPageInfo.json");
  // let resp = require("./json-data/liverpoolFixturePageGetPageInfo.json");
  // let resp = require("./json-data/kabaddiScoreGetPageInfo.json");

  // LOGIN AND PROFILE PAGES
  // let resp = require("./json-data/signupPageGetPageInfo.json");
  // let resp = require("./json-data/loginPageGetPageInfo.json");
  // let resp = require("./json-data/profilePageGetPageInfo.json");

  // DETAIL PAGES
  // let resp = require("./json-data/detailPageGetPageInfo.json");
  // let resp = require("./json-data/ampArticleGetPageInfo.json");
  // let resp = require("./json-data/ampVideoGetPageInfo.json");
  // let resp = require("./json-data/twitterDetailPageGetPageInfo.json");
  // let resp = require("./json-data/articleDetailPageGetPageInfo.json");
  // let resp = require("./json-data/sportDetailPageGetPageInfo.json");
  let resp = require("./json-data/videoDetailPageGetPageInfo.json");

  // MC PAGES
  // let resp = require("./json-data/scorecardPageGetPageInfo.json");
  // let resp = require("./json-data/kabaddiScorecardPageGetPageInfo.json");
  // let resp = require("./json-data/footballPageGetPageInfo.json");

  // WIDGET PAGES
  // let resp = require("./json-data/standingsPageGetPageInfo.json");
  // let resp = require("./json-data/footballStandingsPageGetPageInfo.json");
  // let resp = require("./json-data/seriesListingPageGetPageInfo.json");
  // let resp = require("./json-data/trackerPageGetPageInfo.json");
  // let resp = require("./json-data/statsDetailPageGetPageInfo.json");

  // OTHERS
  // let resp = require("./json-data/errorPageGetPageInfo.json");
  // let resp = require("./json-data/searchPageGetPageInfo.json");
  // let resp = require("./json-data/unsubscribePageGetPgeInfo.json");
  // let resp = require("./json-data/manOfTheMatchGetPageInfo.json");
  // let resp = require("./json-data/manOfTheMatchWebViewGetPageInfo.json");
  // let resp =require("./json-data/tipsAndPredictionsGetPageInfo.json");
  // let resp = require("./json-data/kabaddiScorecardPageGetPageInfo.json");
  // let resp = require("./json-data/tagContentGetPageInfo.json");
  // let resp = require("./json-data/cricketHomePageGetPageInfo.json");
  // let resp = require("./json-data/prodDetailPage.json");
  // let resp = require("./json-data/cricketNewsListingGetPageInfo.json");
  // let resp = require("./json-data/webViewBettingTips.json");

  // ERROR HANDLING
  // let resp = require("./json-data/errorForAllEmptyNodes");
  // let resp = require("./json-data/redirectionData.json");
  res.json(resp);
});

router.get("/getclientinfo", (req, res) => {
  let response = fs.readFileSync("./app/json-data/getclientinfo.json", "utf8");
  res.json(JSON.parse(response));
});

router.get("/polldetail/", (req, res) => {
  // const POLLID = req.query["pollId"];
  const USER_GUID = req.query["guid"];
  const url = `https://beta-sportsadda.sportz.io/api/polldetail/14061?spgnnum=1&sitem=1&user_guid=${USER_GUID}`;
  request(url).pipe(res);
});
router.get("/listing", (req, res) => {
  const ent = req.query["entities"];
  const other = req.query["otherent"];
  // https://stg-sportsadda.sportz.io/api/listing?entities=464,465&otherent=8688,8,4,3&pgnum=1&inum=1&pgsize=10
  const url = `https://stg-sportsadda.sportz.io/api/listing?entities=${ent}&otherent=${other}&pgnum=1&inum=1&pgsize=10`;
  request(url,function(error, response, body){
    if (!error && response.statusCode === 200) { 
      console.log(body); 
      res.send(body); 
    } 
  });
});

router.get("/getrunasoneleaderboard", (req, res) => {
  const POLLID = req.query["pollId"];
  const USER_GUID = req.query["guid"];
  const url = `https://beta-sportsadda.sportz.io/api/getrunasoneleaderboard?user_guid=f82202fd-5de9-45c3-b804-ded9fe15a9e6-05032021124508446&page_count=1&page_size=10`;
  request(url).pipe(res);
});

router.post("/submitpoll", (req, res) => {
  let obj = req.body.data;
  const url = `https://beta-sportsadda.sportz.io/api/submitpoll`;
  request.post(url, function(err, response, body) {
    if (!err && response.status == 200) {
      console.log(response);
      res.send(pipe(res));
    }
  });
});

router.get("/get-routes-for-generation", (req, res) => {
  let responseApis = [];
  fs.readFile("./app/json-data/perMinRoutes.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.json({ apis: responseApis });
    } else {
      const response1 = JSON.parse(data);
      responseApis = response1.apis;
    }
    fs.readFile("./app/json-data/oneTimeRoutes.json", "utf8", (err, data) => {
      if (err) {
        console.log(err);
        res.json({ apis: responseApis });
      } else {
        const response2 = JSON.parse(data);
        responseApis = responseApis.concat(response2.apis);
        res.json({ apis: responseApis });
      }
    });
  });
});

router.use(checkEntityHeader);

router.get("/login", (req, res) => {
  const { username, password } = req.query;
  if (!username || !password) {
    res.status(401).json({
      error: new Error("Invalid request!")
    });
  }
  let userInfo = users.find(userData => userData.userName === username && userData.password === password);
  if (userInfo) {
    req.session.isLogin = true;
    let response = { code: "SUCCESS", isAdmin: userInfo.isAdmin };
    res.json(response);
  } else {
    return res.status(200).json({ error: "101" });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.json({ route: "logout" });
});

router.use(checkLogin);

router.get("/per-min-routes", (req, res) => {
  fs.readFile("./app/json-data/perMinRoutes.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.json({ apis: [] });
    } else {
      const response = JSON.parse(data);
      res.json(response);
    }
  });
});

router.get("/one-time-routes", (req, res) => {
  fs.readFile("./app/json-data/oneTimeRoutes.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.json({ apis: [] });
    } else {
      let response = JSON.parse(data);
      res.json(response);
    }
  });
});

router.post("/add-per-min-routes", (req, res) => {
  const obj = {
    apis: req.body.routes
  };

  fs.readFile("./app/json-data/perMinRoutes.json", "utf8", (err, data) => {
    if (err) {
      console.log(err, "ERROR");
      res.json({ err: "Something went wrong" });
    } else {
      const dataToSave = JSON.parse(data);
      dataToSave.apis = dataToSave.apis.concat(obj.apis);
      dataToSave.apis = helper.removeDuplicates(dataToSave.apis);
      fs.writeFile("./app/json-data/perMinRoutes.json", JSON.stringify(dataToSave), "utf8", (err, data) => {
        if (err) {
          console.log(err, "ERROR");
          res.json({ err: "Something went wrong" });
        } else {
          res.json({ err: "" });
        }
      });
    }
  });
});

router.post("/update-per-min-routes", (req, res) => {
  const obj = {
    apis: helper.removeDuplicates(req.body.routes)
  };
  fs.writeFile("./app/json-data/perMinRoutes.json", JSON.stringify(obj), "utf8", (err, data) => {
    if (err) {
      console.log(err, "ERROR");
      res.json({ err: "Something went wrong" });
    } else {
      res.json({ err: "" });
    }
  });
});

router.post("/add-one-time-routes", (req, res) => {
  const obj = {
    apis: req.body.routes
  };

  fs.readFile("./app/json-data/oneTimeRoutes.json", "utf8", (err, data) => {
    if (err) {
      console.log(err, "ERROR");
      res.json({ err: "Something went wrong" });
    } else {
      const dataToSave = JSON.parse(data);
      dataToSave.apis = dataToSave.apis.concat(obj.apis);
      dataToSave.apis = helper.removeDuplicates(dataToSave.apis);
      fs.writeFile("./app/json-data/oneTimeRoutes.json", JSON.stringify(dataToSave), "utf8", (err, data) => {
        if (err) {
          console.log(err, "ERROR");
          res.json({ err: "Something went wrong" });
        } else {
          res.json({ err: "" });
        }
      });
    }
  });
});

router.post("/update-one-time-routes", (req, res) => {
  const obj = {
    apis: helper.removeDuplicates(req.body.routes)
  };
  fs.writeFile("./app/json-data/oneTimeRoutes.json", JSON.stringify(obj), "utf8", (err, data) => {
    if (err) {
      console.log(err, "ERROR");
      res.json({ err: "Something went wrong" });
    } else {
      res.json({ err: "" });
    }
  });
});

router.post("/delete-per-min-route", (req, res) => {
  const apiToDelete = req.body.route;
  fs.readFile("./app/json-data/perMinRoutes.json", "utf8", (err, data) => {
    if (err) {
      console.log(err, "ERROR");
      res.json({ err: "Something went wrong" });
    } else {
      const dataToSave = JSON.parse(data);
      dataToSave.apis = dataToSave.apis.filter(route => {
        if (route === apiToDelete) {
          return false;
        } else {
          return true;
        }
      });
      fs.writeFile("./app/json-data/perMinRoutes.json", JSON.stringify(dataToSave), "utf8", (err, data) => {
        if (err) {
          console.log(err, "ERROR");
          res.json({ err: "Something went wrong" });
        } else {
          res.json({ err: "" });
        }
      });
    }
  });
});

router.post("/delete-one-time-route", (req, res) => {
  const apiToDelete = req.body.route;
  fs.readFile("./app/json-data/oneTimeRoutes.json", "utf8", (err, data) => {
    if (err) {
      console.log(err, "ERROR");
      res.json({ err: "Something went wrong" });
    } else {
      const dataToSave = JSON.parse(data);
      dataToSave.apis = dataToSave.apis.filter(route => {
        if (route === apiToDelete) {
          return false;
        } else {
          return true;
        }
      });
      fs.writeFile("./app/json-data/oneTimeRoutes.json", JSON.stringify(dataToSave), "utf8", (err, data) => {
        if (err) {
          console.log(err, "ERROR");
          res.json({ err: "Something went wrong" });
        } else {
          res.json({ err: "" });
        }
      });
    }
  });
});

router.get("/get-settings", (req, res) => {
  const settingsConfiguration = settings.getConfig();
  res.json(settingsConfiguration);
});

router.post("/update-settings", (req, res) => {
  const { settingName, settingValue } = req.body;
  settings.updateConfig(settingName, settingValue);
  res.json({ err: "" });
});

router.use("*", function(req, res) {
  res.status(404).send({
    status: false,
    request: {
      route: req.originalUrl,
      method: req.method,
      body: req.body
    },
    message: "route not found"
  });
});
module.exports = { router };
