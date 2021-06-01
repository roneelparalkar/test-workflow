// process.env.NODE_ENV = 'development';

const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;

chai.use(chaiHttp);

describe("pingTest", () => {
  //   beforeEach(done => {
  //     //Before each test we empty the database
  //   });
  /*
   * Test the /ping route
   */
  describe("/GET ping", () => {
    it("it should return pong", done => {
      chai
        .request("http://localhost:3000")
        .get("/ping")
        .set("Content-Type", "application/json")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.be.a("string");
          expect(res.text).to.equal("pong");
          done();
        });
    });
  });
});
