const fs = require("fs-extra");
const inquirer = require("inquirer");

fs.readdir("./../../dist/", (err, files) => {
  if (err) {
    console.log(err);
    return;
  }
  inquirer
    .prompt([
      {
        type: "list",
        name: "client",
        message: "Select client for deployment",
        choices: files
      }
    ])
    .then(answer1 => {
      let client = answer1.client;
      fs.readdir(`./../../clients/${client}/config/`, (err, resp) => {
        if (err) {
          console.log(err);
        } else {
          let environments = [];
          resp.forEach(envFiles => {
            if (envFiles !== "index.js") {
              environments.push(envFiles.replace(".js", ""));
            }
          });
          inquirer
            .prompt([
              {
                type: "list",
                name: "env",
                message: "Select environment",
                choices: environments
              }
            ])
            .then(answer2 => {
              let env = answer2.env;

              let mainConfig = require(`./../../clients/${client}/config/${env}`);
              fs.copySync(`./../../dist/${client}/server-build/`, `./../../final-build/dist/${client}/server-build/`);
              fs.copySync(`./../../routes/`, `./../../final-build/routes/`);
              fs.copySync(`./../../sdk/`, `./../../final-build/sdk/`);
              fs.copySync(`./../../server-middleware/`, `./../../final-build/server-middleware/`);
              fs.copySync(`./../../clients/${client}/static-${env}/`, `./../../final-build/static/`);
              fs.copySync(`./../../package.json`, `./../../final-build/package.json`);
              fs.copySync(`./../../nuxt.config.js`, `./../../final-build/nuxt.config.js`);
              fs.copySync(`./../../logger.js`, `./../../final-build/logger.js`);
              fs.copySync(`./../../app.js`, `./../../final-build/app.js`);
              fs.writeFileSync(`./../../final-build/config.json`, JSON.stringify(mainConfig));
            });
        }
      });
    });
});
