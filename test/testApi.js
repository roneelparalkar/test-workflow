const request = require("request");
const expect = require("chai").expect;
const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const baseUrl = "https://stg-sportsadda.sportz.io";
const paths = require("./paths.json");

describe("sport pages", function() {
  //   let pathsArray = fs
  //     .readFileSync("test/paths/sports-pages.txt")
  //     .toString()
  //     .split(",");
  let pathsArray = paths.sports;

  this.timeout(16000);
  for (let index = 0; index < pathsArray.length; index++) {
    const path = pathsArray[index];
    const completeUrl = baseUrl + path;
    let selectorArray = [];
    let sectionArray = [];
    const api = `${baseUrl}/apiv3/gettemplatedata?url=${path}`;
    it(`returns response for ${completeUrl}`, function(done) {
      request.get({ url: api }, (error, response, body) => {
        const bodyObj = JSON.parse(body);
        // put all selectors from api in selectorArray
        bodyObj.content.module.forEach(object => {
          selectorArray.push(object.selector);
        });
        bodyObj.content.master_module.forEach(object => {
          selectorArray.push(object.selector);
        });

        //remove Master Social Links selector
        var filteredSelectorArray = selectorArray.filter(selector => {
          return selector != "0965b9db-cc94-4d77-a7cd-44d3ece13a60";
        });

        request.get({ url: completeUrl }, function(error, response, body) {
          //   console.log(selectorArray);
          expect(response.statusCode).to.equal(200);
          const dom = new JSDOM(response.body);
          //create sectionArray for all selector-id's in html response
          dom.window.document.querySelectorAll("section").forEach(el => {
            sectionArray.push(el.getAttribute("id"));
          });
          //find selector-id from api in markup
          filteredSelectorArray.forEach(element => {
            // console.log(dom.window.document.querySelectorAll(`[id="${element}"]`)[0].getAttribute('id'));
            expect(element).to.equal(
              sectionArray.find(el => {
                return el == element;
              })
            );
          });
          // expect(dom.window.document.querySelector("div").getAttribute("data-server-rendered")).to.equal("true");
          done();
        });
      });
    });
  }
});

describe("scores-fixture pages", function() {
  this.timeout(16000);
  let pathsArray = paths.fixtures;

  for (let index = 0; index < pathsArray.length; index++) {
    const path = pathsArray[index];
    const completeUrl = baseUrl + path;
    let selectorArray = [];
    let sectionArray = [];
    const api = `${baseUrl}/apiv3/gettemplatedata?url=${path}`;
    it(`returns response for ${completeUrl}`, function(done) {
      request.get({ url: api }, (error, response, body) => {
        const bodyObj = JSON.parse(body);
        // put all selectors from api in selectorArray
        bodyObj.content.module.forEach(object => {
          selectorArray.push(object.selector);
        });
        bodyObj.content.master_module.forEach(object => {
          selectorArray.push(object.selector);
        });

        //remove Master Social Links selector
        // let filteredSelectorArray=[...selectorArray]
        var filteredSelectorArray = selectorArray.filter(selector => {
          return selector != "0965b9db-cc94-4d77-a7cd-44d3ece13a60";
        });

        request.get({ url: completeUrl }, function(error, response, body) {
          //   console.log(selectorArray);
          expect(response.statusCode).to.equal(200);
          const dom = new JSDOM(response.body);
          //create sectionArray for all selector-id's in html response
          dom.window.document.querySelectorAll("section").forEach(el => {
            sectionArray.push(el.getAttribute("id"));
          });
          //find selector-id from api in markup
          filteredSelectorArray.forEach(element => {
            // console.log(dom.window.document.querySelectorAll(`[id="${element}"]`)[0].getAttribute('id'));
            expect(element).to.equal(
              sectionArray.find(el => {
                return el == element;
              })
            );
          });
          // expect(dom.window.document.querySelector("div").getAttribute("data-server-rendered")).to.equal("true");
          done();
        });
      });
    });
  }
});

describe("games pages", function() {
  this.timeout(16000);
  let pathsArray = paths.games;

  for (let index = 0; index < pathsArray.length; index++) {
    const path = pathsArray[index];
    const completeUrl = baseUrl + path;
    let selectorArray = [];
    let sectionArray = [];
    const api = `${baseUrl}/apiv3/gettemplatedata?url=${path}`;
    it(`returns response for ${completeUrl}`, function(done) {
      request.get({ url: api }, (error, response, body) => {
        const bodyObj = JSON.parse(body);
        // put all selectors from api in selectorArray
        bodyObj.content.module.forEach(object => {
          selectorArray.push(object.selector);
        });
        bodyObj.content.master_module.forEach(object => {
          selectorArray.push(object.selector);
        });

        //remove Master Social Links selector
        //   let filteredSelectorArray=[...selectorArray]
        var filteredSelectorArray = selectorArray.filter(selector => {
          return selector != "0965b9db-cc94-4d77-a7cd-44d3ece13a60";
        });

        request.get({ url: completeUrl }, function(error, response, body) {
          //   console.log(selectorArray);
          expect(response.statusCode).to.equal(200);
          const dom = new JSDOM(response.body);
          //create sectionArray for all selector-id's in html response
          dom.window.document.querySelectorAll("section").forEach(el => {
            sectionArray.push(el.getAttribute("id"));
          });
          //find selector-id from api in markup
          filteredSelectorArray.forEach(element => {
            // console.log(dom.window.document.querySelectorAll(`[id="${element}"]`)[0].getAttribute('id'));
            expect(element).to.equal(
              sectionArray.find(el => {
                return el == element;
              })
            );
          });
          // expect(dom.window.document.querySelector("div").getAttribute("data-server-rendered")).to.equal("true");
          done();
        });
      });
    });
  }
});

describe("home page", function() {
  this.timeout(16000);
  let pathsArray = paths.home;

  for (let index = 0; index < pathsArray.length; index++) {
    const path = pathsArray[index];
    const completeUrl = baseUrl + path;
    let selectorArray = [];
    let sectionArray = [];
    const api = `${baseUrl}/apiv3/gettemplatedata?url=${path}`;
    it(`returns response for ${completeUrl}`, function(done) {
      request.get({ url: api }, (error, response, body) => {
        const bodyObj = JSON.parse(body);
        // put all selectors from api in selectorArray
        bodyObj.content.module.forEach(object => {
          selectorArray.push(object.selector);
        });
        bodyObj.content.master_module.forEach(object => {
          selectorArray.push(object.selector);
        });

        //remove Master Social Links selector
        //   let filteredSelectorArray=[...selectorArray]
        var filteredSelectorArray = selectorArray.filter(selector => {
          return selector != "0965b9db-cc94-4d77-a7cd-44d3ece13a60";
        });

        request.get({ url: completeUrl }, function(error, response, body) {
          //   console.log(selectorArray);
          expect(response.statusCode).to.equal(200);
          const dom = new JSDOM(response.body);
          //create sectionArray for all selector-id's in html response
          dom.window.document.querySelectorAll("section").forEach(el => {
            sectionArray.push(el.getAttribute("id"));
          });
          //find selector-id from api in markup
          filteredSelectorArray.forEach(element => {
            // console.log(dom.window.document.querySelectorAll(`[id="${element}"]`)[0].getAttribute('id'));
            expect(element).to.equal(
              sectionArray.find(el => {
                return el == element;
              })
            );
          });
          // expect(dom.window.document.querySelector("div").getAttribute("data-server-rendered")).to.equal("true");
          done();
        });
      });
    });
  }
});

describe("betting pages", function() {
  this.timeout(16000);
  let pathsArray = paths.betting;

  for (let index = 0; index < pathsArray.length; index++) {
    const path = pathsArray[index];
    const completeUrl = baseUrl + path;
    let selectorArray = [];
    let sectionArray = [];
    const api = `${baseUrl}/apiv3/gettemplatedata?url=${path}`;
    it(`returns response for ${completeUrl}`, function(done) {
      request.get({ url: api }, (error, response, body) => {
        const bodyObj = JSON.parse(body);
        // put all selectors from api in selectorArray
        bodyObj.content.module.forEach(object => {
          selectorArray.push(object.selector);
        });
        bodyObj.content.master_module.forEach(object => {
          selectorArray.push(object.selector);
        });

        //remove Master Social Links selector
        //   let filteredSelectorArray=[...selectorArray]
        var filteredSelectorArray = selectorArray.filter(selector => {
          return selector != "0965b9db-cc94-4d77-a7cd-44d3ece13a60";
        });

        request.get({ url: completeUrl }, function(error, response, body) {
          //   console.log(selectorArray);
          expect(response.statusCode).to.equal(200);
          const dom = new JSDOM(response.body);
          //create sectionArray for all selector-id's in html response
          dom.window.document.querySelectorAll("section").forEach(el => {
            sectionArray.push(el.getAttribute("id"));
          });
          //find selector-id from api in markup
          filteredSelectorArray.forEach(element => {
            // console.log(dom.window.document.querySelectorAll(`[id="${element}"]`)[0].getAttribute('id'));
            expect(element).to.equal(
              sectionArray.find(el => {
                return el == element;
              })
            );
          });
          // expect(dom.window.document.querySelector("div").getAttribute("data-server-rendered")).to.equal("true");
          done();
        });
      });
    });
  }
});

describe("video pages", function() {
  this.timeout(16000);
  let pathsArray = paths.videos;

  for (let index = 0; index < pathsArray.length; index++) {
    const path = pathsArray[index];
    const completeUrl = baseUrl + path;
    let selectorArray = [];
    let sectionArray = [];
    const api = `${baseUrl}/apiv3/gettemplatedata?url=${path}`;
    it(`returns response for ${completeUrl}`, function(done) {
      request.get({ url: api }, (error, response, body) => {
        const bodyObj = JSON.parse(body);
        // put all selectors from api in selectorArray
        bodyObj.content.module.forEach(object => {
          selectorArray.push(object.selector);
        });
        bodyObj.content.master_module.forEach(object => {
          selectorArray.push(object.selector);
        });

        //remove Master Social Links selector
        //   let filteredSelectorArray=[...selectorArray]
        var filteredSelectorArray = selectorArray.filter(selector => {
          return selector != "0965b9db-cc94-4d77-a7cd-44d3ece13a60";
        });

        request.get({ url: completeUrl }, function(error, response, body) {
          //   console.log(selectorArray);
          expect(response.statusCode).to.equal(200);
          const dom = new JSDOM(response.body);
          //create sectionArray for all selector-id's in html response
          dom.window.document.querySelectorAll("section").forEach(el => {
            sectionArray.push(el.getAttribute("id"));
          });
          //find selector-id from api in markup
          filteredSelectorArray.forEach(element => {
            // console.log(dom.window.document.querySelectorAll(`[id="${element}"]`)[0].getAttribute('id'));
            expect(element).to.equal(
              sectionArray.find(el => {
                return el == element;
              })
            );
          });
          // expect(dom.window.document.querySelector("div").getAttribute("data-server-rendered")).to.equal("true");
          done();
        });
      });
    });
  }
});

describe("news pages", function() {
  this.timeout(16000);
  let pathsArray = paths.news;

  for (let index = 0; index < pathsArray.length; index++) {
    const path = pathsArray[index];
    const completeUrl = baseUrl + path;
    let selectorArray = [];
    let sectionArray = [];
    const api = `${baseUrl}/apiv3/gettemplatedata?url=${path}`;
    it(`returns response for ${completeUrl}`, function(done) {
      request.get({ url: api }, (error, response, body) => {
        const bodyObj = JSON.parse(body);
        // put all selectors from api in selectorArray
        bodyObj.content.module.forEach(object => {
          selectorArray.push(object.selector);
        });
        bodyObj.content.master_module.forEach(object => {
          selectorArray.push(object.selector);
        });

        //remove Master Social Links selector
        //   let filteredSelectorArray=[...selectorArray]
        var filteredSelectorArray = selectorArray.filter(selector => {
          return selector != "0965b9db-cc94-4d77-a7cd-44d3ece13a60";
        });

        request.get({ url: completeUrl }, function(error, response, body) {
          //   console.log(selectorArray);
          expect(response.statusCode).to.equal(200);
          const dom = new JSDOM(response.body);
          //create sectionArray for all selector-id's in html response
          dom.window.document.querySelectorAll("section").forEach(el => {
            sectionArray.push(el.getAttribute("id"));
          });
          //find selector-id from api in markup
          filteredSelectorArray.forEach(element => {
            // console.log(dom.window.document.querySelectorAll(`[id="${element}"]`)[0].getAttribute('id'));
            expect(element).to.equal(
              sectionArray.find(el => {
                return el == element;
              })
            );
          });
          // expect(dom.window.document.querySelector("div").getAttribute("data-server-rendered")).to.equal("true");
          done();
        });
      });
    });
  }
});

describe("other pages", function() {
  this.timeout(16000);
  let pathsArray = paths.others;

  for (let index = 0; index < pathsArray.length; index++) {
    const path = pathsArray[index];
    const completeUrl = baseUrl + path;
    let selectorArray = [];
    let sectionArray = [];
    const api = `${baseUrl}/apiv3/gettemplatedata?url=${path}`;
    it(`returns response for ${completeUrl}`, function(done) {
      request.get({ url: api }, (error, response, body) => {
        const bodyObj = JSON.parse(body);
        // put all selectors from api in selectorArray
        bodyObj.content.module.forEach(object => {
          selectorArray.push(object.selector);
        });
        bodyObj.content.master_module.forEach(object => {
          selectorArray.push(object.selector);
        });

        //remove Master Social Links selector
        //   let filteredSelectorArray=[...selectorArray]
        var filteredSelectorArray = selectorArray.filter(selector => {
          return selector != "0965b9db-cc94-4d77-a7cd-44d3ece13a60";
        });

        request.get({ url: completeUrl }, function(error, response, body) {
          //   console.log(selectorArray);
          expect(response.statusCode).to.equal(200);
          const dom = new JSDOM(response.body);
          //create sectionArray for all selector-id's in html response
          dom.window.document.querySelectorAll("section").forEach(el => {
            sectionArray.push(el.getAttribute("id"));
          });
          //find selector-id from api in markup
          filteredSelectorArray.forEach(element => {
            // console.log(dom.window.document.querySelectorAll(`[id="${element}"]`)[0].getAttribute('id'));
            expect(element).to.equal(
              sectionArray.find(el => {
                return el == element;
              })
            );
          });
          // expect(dom.window.document.querySelector("div").getAttribute("data-server-rendered")).to.equal("true");
          done();
        });
      });
    });
  }
});
