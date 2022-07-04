const { expressjwt: jwt } = require("express-jwt");
const fs = require("fs");
const path = require("path");
const DbStore = require("db-store");
const DbStoreModel = DbStore.db;
const PUB_KEY = fs.readFileSync(
  path.join(__dirname, "../..", "/keys/id_rsa_pub.pem"),
  "utf8"
);
const status = require("http-status");

module.exports = authorize;

function authorize(roles = []) {
  // roles param can be a single role string (e.g. Role.User or 'User')
  // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
  if (typeof roles === "string") {
    roles = [roles];
  }

  return [
    // authenticate JWT token and attach user to request object (req.user)
    jwt({ secret: PUB_KEY, algorithms: ["RS256"] }),

    // authorize based on user role
    async (req, res, next) => {
      const account = await DbStoreModel.Account.findByPk(req.auth.id);

      if (!account || (roles.length && !roles.includes(account.role))) {
        // account no longer exists or role not authorized
        return res
          .status(status.UNAUTHORIZED)
          .send({ message: status[`${status.UNAUTHORIZED}_MESSAGE`] });
      }

      // authentication and authorization successful
      req.auth.role = account.role;
      req.auth.managerId = account.managerId;
      const refreshTokens = await account.getRefreshTokens();
      req.auth.ownsToken = (token) =>
        !!refreshTokens.find((x) => x.token === token);
      next();
    },
  ];
}
