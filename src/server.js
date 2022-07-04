global.config = require("./config/config");
global.config.env =
  process.env.NODE_ENV === "production" ? "production" : "development";

const logger = require("./logger");
const DbStore = require("db-store");
/*
const os = require("os");
const cluster = require("cluster");
const http = require("http");
const https = require("https");
const CPUS = os.cpus();
const fs = require("fs");
const path = require("path");

const { setupMaster } = require("@socket.io/sticky");
const { setupPrimary } = require("@socket.io/cluster-adapter");
*/
DbStore.init()
  .then((result) => {
    if (result) {
      logger.info("Database Initialized");
    }
    /*
  if (CPUS.length > 1 && cluster.isMaster) {
    let httpServer;
    if (process.env.NODE_ENV === "production") {
      const privateKey = fs.readFileSync(path.join(__dirname, "privkey.pem"), "utf8");
      const certificate = fs.readFileSync(path.join(__dirname, "fullchain.pem"), "utf8");
      httpServer = https.createServer({ key: privateKey, cert: certificate });
    } else {
      httpServer = http.createServer();
    }
    // setup sticky sessions
    setupMaster(httpServer, {
      loadBalancingMethod: "least-connection"
    });
  
    // setup connections between the workers
    setupPrimary();
  
    // needed for packets containing buffers (you can ignore it if you only send plaintext objects)
    // Node.js < 16.0.0
    cluster.setupMaster({
      serialization: "advanced"
    });
    // Node.js > 16.0.0
    // cluster.setupPrimary({
    //   serialization: "advanced",
    // });
  
    httpServer.listen(8080);
  
    for (let i = 0; i < 1; i++) {
      cluster.fork();
    }
  
    cluster.on("listening", function (worker) {
      console.log("Cluster %d connected", worker.process.pid);
    });
    cluster.on("disconnect", function (worker) {
      console.log("Cluster %d disconnected", worker.process.pid);
    });
    cluster.on("exit", function (worker) {
      console.log("Cluster %d is dead", worker.process.pid);
      // Ensuring a new cluster will start if an old one dies
      cluster.fork();
    });
  } else {
    require("./index.js");
  } 
  */
    require("./index.js");
  })
  .catch((err) => {
    console.error(err);
  });
