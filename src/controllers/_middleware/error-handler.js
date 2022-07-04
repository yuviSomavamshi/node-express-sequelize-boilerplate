const status = require("http-status");

module.exports = (err, req, res) => {
  try {
    logger.error("API Error", err);
    switch (true) {
      case typeof err === "string":
        // custom application error
        const is404 = err.toLowerCase().endsWith("not found");
        const statusCode = is404 ? 404 : 400;
        return res.status(statusCode).json({ message: err });
      case err.name === "UnauthorizedError":
        // jwt authentication error
        return res
          .status(status.UNAUTHORIZED)
          .json({ message: status[`${status.UNAUTHORIZED}_MESSAGE`] });
      default:
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .send({
            error: err.message,
            message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`],
          });
    }
  } catch (error) {
    logger.error("Exception Error", error);
  }
};
