const status = require("http-status");

module.exports = function (req, res, next) {
  const csrfToken = req.get("X-CSRF-Token");
  if (!csrfToken) {
    return res
      .status(status.UNAUTHORIZED)
      .send({
        error: "CSRF token missing. Please refresh the page.",
        message: status[`${status.UNAUTHORIZED}_MESSAGE`],
      });
  }
  if (!req.session.csrfToken) {
    return res
      .status(status.UNAUTHORIZED)
      .send({
        error:
          "No CSRF token recorded in your session. Please refresh the page.",
        message: status[`${status.UNAUTHORIZED}_MESSAGE`],
      });
  }
  if (req.session.csrfToken !== csrfToken) {
    return res
      .status(status.UNAUTHORIZED)
      .send({
        error: "Invalid CSRF token. Please refresh the page.",
        message: status[`${status.UNAUTHORIZED}_MESSAGE`],
      });
  }
  next();
};
