/**
 ** logger module that initializes log4js settings.
 **/
const config = require("./config/config");
const log4js = require("log4js"),
  path = require("path"),
  fs = require("fs"),
  fileStreamRotator = require("file-stream-rotator"),
  Morgan = require("morgan"),
  jwt = require("jsonwebtoken");
var logger;

const loggerConfig = config.logger;

// create the logs folder if not existing.
let logdir;
if (loggerConfig.logdir) {
  logdir = path.resolve(loggerConfig.logdir);
} else {
  logdir = path.join(__dirname, "/logs");
}
if (!fs.existsSync(logdir)) {
  fs.mkdirSync(logdir);
}

// set up CDR"s logging
const accessLogStream = fileStreamRotator.getStream({
  date_format: "YYYYMMDDHH",
  filename: path.join(loggerConfig.logdir, loggerConfig.cdr + "_%DATE%.cdr"),
  frequency: "daily",
  verbose: false,
});
Morgan.token("username", function (req) {
  try {
    if (req.headers && req.headers.authorization) {
      let decoded = jwt.decode(req.headers["authorization"].substring(7));
      return decoded && decoded.loginId;
    } else {
      return req.body.loginId || req.body.username;
    }
  } catch (err) {
    logger.error("Error in logging username in access cdrs:", err);
  }
});
/**
 *  if User is getting added,deleted,deactivated - user is the event [userid:username]
 *  if app is getting created,archived
 *  plugins -uploaded,enabled/disabled,deleted - pluginId:pluginName(servicename,wsdl)- event
 */
Morgan.token("event", function (req, res) {
  try {
    if (req.originalUrl.split("/")[2] == "project") {
      return req.params.userId ? req.params.userId : req.body.loginId;
    } else if (req.originalUrl.split("/")[2] == "apps") {
      return req.params.appId ? req.params.appId : req.body.id;
    } else if (req.originalUrl.split("/")[2] == "workflow") {
      return req.params.appId ? req.params.appId : req.body.appId;
    } else if (req.originalUrl.split("/")[2] == "pm") {
      return req.params.pluginId ? req.params.pluginId : req.body.pluginId;
    } else if (req.originalUrl.split("/")[2] == "plugins") {
      return req.files && req.files.toString();
    }
  } catch (err) {
    logger.error("Error in logging event in access cdrs:", err);
  }
});
Morgan.token("process", function (req, res) {
  try {
    return process.pid;
  } catch (err) {
    logger.error("Error in logging event in access cdrs:", err);
  }
});
Morgan.token("transactionId", function (req, res) {
  try {
    return req.txnId;
  } catch (err) {
    logger.error("Error in logging event in access cdrs:", err);
  }
});

const morgan = Morgan(loggerConfig.cdrFormat, { stream: accessLogStream });

log4js.configure(loggerConfig.log4js);
logger = log4js.getLogger("project");

logger.level = loggerConfig.log4js.categories.default.level;

logger.morgan = morgan;
global.log4js = log4js;
global.logger = logger;

module.exports = logger;
