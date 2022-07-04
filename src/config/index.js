const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const EnvironmentalSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(4001),
    TIMEZONE: Joi.string().description("Time zone").default("+05:30"),
    DATABASE_NAME: Joi.string().description("Database name").required(),
    DATABASE_HOST: Joi.string()
      .description("Database server host address")
      .required(),
    DATABASE_PORT: Joi.number()
      .description("Database server port number")
      .default(3306),
    DATABASE_USERNAME: Joi.string().description("Database username").required(),
    DATABASE_PASSWORD: Joi.string().description("Database password").required(),
    DATABASE_DIALECT: Joi.string()
      .description("Database Dialect")
      .default("sqlite"),
    DATABASE_STORAGE: Joi.string()
      .description("sqlite Storage path")
      .default("../data.sqlite"),
    DATABASE_MIN_CONNECTIONS: Joi.number()
      .description("Database Minimum Connections")
      .default(1),
    DATABASE_MAX_CONNECTIONS: Joi.number()
      .description("Database Maximum Connections")
      .default(9),
    DATABASE_LOGGING: Joi.boolean()
      .description("Enable logging")
      .default(false),
    LOG_LEVEL: Joi.string()
      .valid("all", "trace", "debug", "info", "warn", "error", "fatal")
      .default("all"),
    SMTP_FROM: Joi.string().description("SMTP from name").required(),
    SMTP_HOST: Joi.string().description("SMTP server host address").required(),
    SMTP_PORT: Joi.number().description("SMTP server port number").default(465),
    SMTP_USER: Joi.string().description("SMTP server user name").required(),
    SMTP_PASSWORD: Joi.string().description("SMTP server password").required(),
    REDIS_HOST: Joi.string()
      .description("REDIS server host address")
      .required(),
    REDIS_PORT: Joi.number()
      .description("REDIS server port number")
      .default(6379),
    REDIS_PASSWORD: Joi.string()
      .description("REDIS server password")
      .required(),
    REFRESH_TOKEN_EXPIRY: Joi.string()
      .description("JWT refresh token expiration")
      .default("1d"),
    JWT_TOKEN_EXPIRY: Joi.string()
      .description("JWT token expiration")
      .default("10m"),
    OTP_EXPIRY_TIME: Joi.string()
      .description("OTP expiration time")
      .default("5m"),
    MAX_ALLOWED_OTP: Joi.number()
      .description("Maximum number of allowed OTP")
      .default(5),
  })
  .unknown();

const { value: ENV, error } = EnvironmentalSchema.prefs({
  errors: { label: "key" },
}).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const databaseConfig = {};
if (ENV.DATABASE_DIALECT === "mysql" || ENV.DATABASE_DIALECT === "mariadb") {
  databaseConfig.port = ENV.DATABASE_PORT;
  databaseConfig.logging = ENV.DATABASE_LOGGING;
  databaseConfig.pool = {
    minConnections: ENV.DATABASE_MIN_CONNECTIONS,
    maxIdleTime: ENV.DATABASE_MAX_CONNECTIONS,
  };
  databaseConfig.dialectOptions = {
    dateStrings: true,
    typeCast: true,
    timezone: ENV.TIMEZONE,
  };
  databaseConfig.timezone = ENV.TIMEZONE;
} else if (ENV.DATABASE_DIALECT === "sqlite") {
  databaseConfig.storage = path.resolve(ENV.DATABASE_STORAGE);
}

module.exports = {
  security: {
    enabled: false,
    allowedIPs: [],
    allowedRestMethods: ["GET", "POST", "OPTIONS"],
    cors: [],
  },
  jwt: {
    JWT_TOKEN_EXPIRY: ENV.JWT_TOKEN_EXPIRY,
    OTP_EXPIRY_TIME: ENV.OTP_EXPIRY_TIME,
    REFRESH_TOKEN_EXPIRY: ENV.REFRESH_TOKEN_EXPIRY,
    MAX_ALLOWED_OTP: ENV.MAX_ALLOWED_OTP,
  },
  smtp: {
    from: ENV.SMTP_FROM,
    smtpOptions: {
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: true,
      auth: {
        authentication: "plain",
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASSWORD,
      },
    },
  },
  logger: {
    logdir: "/logs",
    cdr: "api_access",
    cdrFormat:
      "[:date[iso]] :transactionId :process :remote-addr :remote-user :username :method :url HTTP/:http-version :status :res[content-length] :response-time :referrer :event",
    log4js: {
      appenders: {
        console: { type: "console" },
        api: {
          type: "dateFile",
          filename: "\\logs\\api-service.log",
          pattern: ".yyyy-MM-dd_hh",
          layout: {
            type: "pattern",
            pattern: "%d{ISO8601}|%p|%m",
          },
        },
      },
      categories: { default: { level: ENV.LOG_LEVEL, appenders: ["api"] } },
    },
  },
  DBstore: {
    host: ENV.DATABASE_HOST,
    username: ENV.DATABASE_USERNAME,
    password: ENV.DATABASE_PASSWORD,
    database: ENV.DATABASE_NAME,
    dialect: ENV.DATABASE_DIALECT,
    ...databaseConfig,
  },
  redis: {
    host: ENV.REDIS_HOST,
    port: ENV.REDIS_PORT,
    password: ENV.REDIS_PASSWORD,
  },
};
