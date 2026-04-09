module.exports = {
  apps: [{
    name: "nevr-fade",
    script: "./server.js",
    instances: 1,
    env: {
      NODE_ENV: "production",
      PORT: 7826,
      BASE_PATH: "/"
    }
  }]
}