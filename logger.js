"use strict";
const winston = require("winston");
require("winston-daily-rotate-file");

const fileOptions = { filename: "./application-logs/access/access.log", datePattern: "YYYY-MM-DD-HH", maxSize: "10m", maxFiles: "120" };
const logger = winston.createLogger({
  level: "info",
  // format: winston.format.json(),
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.DailyRotateFile(fileOptions)
  ]
});

logger.stream = {
  write: function(message, encoding) {
    try {
      let messageArray = message.split(" ");
      if (messageArray[1].includes("ping") || messageArray[1].includes("static-assets")) return;
      if (+messageArray[2] < 400) {
        let responseTime = messageArray[3].replace("ms");
        if (+responseTime > 1000) {
          return logger.warn(message);
        } else {
          return logger.info(message);
        }
      } else {
        return logger.error(message);
      }
    } catch (e) {
      console.log(e);
    }
  }
};

// if (process.env.NODE_ENV === "development") {
//   logger.add(
//     new winston.transports.Console({
//       format: winston.format.simple()
//     })
//   );
// }
module.exports = logger;
