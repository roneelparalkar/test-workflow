module.exports = {
  apps: [
    {
      name: "Waf-Nuxt",
      exec_mode: "cluster",
      instances: "max",
      script: "./app.js",
      args: "start",
      env_dev: {
        PORT: 3000,
        NODE_ENV: "development",
        REDIS_READ_END_POINT: undefined,
        REDIS_READ_PORT: undefined,
        REDIS_WRITE_END_POINT: undefined,
        REDIS_WRITE_PORT: undefined
      },
      env_beta: {
        PORT: 80,
        NODE_ENV: "beta",
        REDIS_READ_END_POINT: "",
        REDIS_WRITE_END_POINT: "",
        REDIS_READ_PORT: "6379",
        REDIS_WRITE_PORT: "6379"
      },
      env: {
        PORT: 80,
        NODE_ENV: "production",
        REDIS_READ_END_POINT: "",
        REDIS_WRITE_END_POINT: "",
        REDIS_READ_PORT: "6379",
        REDIS_WRITE_PORT: "6379"
      }
    }
  ]
};
