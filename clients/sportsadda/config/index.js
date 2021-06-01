let config = require(`./${process.env.NODE_ENV}`);

config.LOCAL_LANG_CONFIG = {
  english: "en",
  default: "en"
};

module.exports = config;
