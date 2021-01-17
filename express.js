const express = require("express");
const { validate, ValidationError } = require("express-validation");
const bodyParser = require("body-parser");
const expressSanitized = require("express-sanitized");
const helmet = require("helmet");
const httpStatus = require("http-status");
const cors = require("cors");
const jwt = require("express-jwt");

const APIError = require("./api-error");
const config = require("./config");
const validators = require("./validators");
const controllers = require("./controllers");

const app = express();

// secure apps by setting various HTTP headers
app.use(helmet());

// serve static files from /public folder
app.use(express.static("public"));

// configure CORS
const corsOptions = {
  origin: config.corsAllowedOrigins,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders: ["Authorization", "Total-Count"],
  credentials: true,
};

// configure express-jwt
const jwtOptions = {
  secret: config.jwtSecret,
  algorithms: ["HS256"],
  requestProperty: "auth",
};

app.use(cors(corsOptions));

// express body parser
const jsonBodyParser = bodyParser.json();

app.get("/status", controllers.checkStatus);

// set up endpoint POST /tokens
app.post(
  "/tokens",
  jsonBodyParser,
  expressSanitized(),
  validate(validators.createToken, { keyByField: true }, {}),
  controllers.createAndSendToken
);

// app.get("/licences", jwt(jwtOptions), controllers.listLicences);

// app.get(
//   "/licences/:licenceId",
//   jwt(jwtOptions),
//   controllers.loadLicence,
//   controllers.checkLicenceAccess,
//   controllers.getLicence
// );

// app.patch(
//   "/licences/:licenceId",
//   jwt(jwtOptions),
//   controllers.loadLicence,
//   controllers.checkLicenceAccess,
//   expressSanitized(),
//   validate(validators.updateLicence, { keyByField: true }, {}),
//   controllers.updateLicence
// );

// app.get(
//   "/licences/:licenceId/activations",
//   jwt(jwtOptions),
//   controllers.loadLicence,
//   controllers.checkLicenceAccess,
//   controllers.getLicenceActivations
// );

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    const responseBody = {
      message: err.message,
      details: err.details,
    };
    res.status(err.statusCode).json(responseBody);
    return null;
  } else if (!(err instanceof APIError)) {
    const apiError = new APIError(err.message, err.status, err.isPublic);
    return next(apiError);
  } else {
    return next(err);
  }
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new APIError("Route not found", httpStatus.NOT_FOUND, true);
  return next(err);
});

// error handler, send stacktrace only during development
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (!err.status) {
    err.status = 500;
  }

  const responseBody = {
    message: err.isPublic ? err.message : httpStatus[err.status],
  };

  if (config.env === "development") {
    responseBody.stack = err.stack;
  }

  res.status(err.status).json(responseBody);
});

module.exports = app;
