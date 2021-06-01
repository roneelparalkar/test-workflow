"use strict";
const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("*", (req, res) => {
  let url = req.params["0"];

  let api = "https://beta-sportsadda.sportz.io/sifeeds" + url;
  if (req.query.type == 2) {
    api = "https://beta-sportsadda.sportz.io/" + url;
  }
  if (req.query && Object.keys(req.query).length) {
    api += "?";
    Object.keys(req.query).forEach((key, index) => {
      let queryString = `${index ? "&" : ""}${key}=${req.query[key]}`;
      api += queryString;
    });
  }
  axios.get(api).then(resp => {
    res.json(resp.data);
  });
});

module.exports = { router };
