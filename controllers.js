const httpStatus = require("http-status");
const _ = require("underscore");
const emails = require("email-addresses");
const jwt = require("jsonwebtoken");
const { get } = require("dot-prop");

const sequelize = require("./sequelize");
const APIError = require("./api-error");
const config = require("./config");

const JWT_EXPIRY = "24h";

const models = sequelize.models;

function checkStatus(req, res, next) {
  res.status(httpStatus.OK);
  return res.json({ message: "OK" });
}

function createAndSendToken(req, res, next) {
  // check user exists (find by email address)
  let user;
  models.User.findOne({
    where: { emailAddress: req.body.emailAddress },
  })
    .then((result) => {
      user = result;
      if (!user) {
        const err = new APIError("User not found", httpStatus.NOT_FOUND, true);
        throw err;
      }

      const payload = { user: user.get({ plain: true }) };

      // generate token
      const token = jwt.sign(payload, config.jwtSecret, {
        expiresIn: JWT_EXPIRY,
      });

      // send token to user by email
      return user.sendPasswordlessAuthenticationEmail(token);
    })
    .then((result) => {
      const responseBody = {
        code: "token_created",
        message: "Access token sent by email",
      };

      res.status(httpStatus.CREATED);
      res.json(responseBody);
      return null;
    })
    .catch(next);
}

module.exports = {
  checkStatus,
  createAndSendToken,
};
