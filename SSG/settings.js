const settings = {
  config: {
    interval: 2
  },
  getConfig: () => {
    return settings.config;
  },
  updateConfig: (key, value) => {
    if (settings.config[key]) {
      settings.config[key] = value;
    }
  }
};

module.exports = settings;
