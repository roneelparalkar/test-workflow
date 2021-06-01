const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { SHELL_SCRIPT_DIR } = global.CONFIG;
module.exports = {
  build: cb => {
    const scriptPath = `${SHELL_SCRIPT_DIR}generate-website.sh`;
    const shellScript = `sh ${scriptPath}`;
    exec(shellScript, (err, stdout, stderr) => {
      if (err) {
        // console.log(err, "ERR");
      }
      if (stderr) {
        // console.log(stderr, "STDERR");
      }
      if (stdout) {
        // console.log("stdout", stdout);
        if (cb) cb();
      }
    });
  }
};
