const Joi = require("joi");
const _ = require("underscore");

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require("dotenv").config();

// define validation for all the env vars
const schema = Joi.object({
  NODE_ENV: Joi.string()
    .allow("development", "test", "staging", "production")
    .default("development"),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri(),
  MAILGUN_API_KEY: Joi.string().required(),
  MAILGUN_DOMAIN: Joi.string().required(),
  MAILGUN_TEST_MODE: Joi.boolean().default(true),
  MAILGUN_HOST: Joi.string().default("api.mailgun.net"),
  SENDER_EMAIL_ADDRESS: Joi.string().email().default("noreply@example.com"),
  DELAY_RESPONSE: Joi.number().default(0),
  CORS_ALLOWED_ORIGINS: Joi.array()
    .items(Joi.string().uri())
    .min(1)
    .default(["http://localhost:8080"]),
  JWT_SECRET: Joi.string().required(),
  DEFAULT_ADMIN_EMAIL_ADDRESS: Joi.string()
    .email()
    .default("admin@example.com"),
  TWILIO_ACCOUNT_SID: Joi.string().required(),
  TWILIO_AUTH_TOKEN: Joi.string().required(),
  INTERCOM_PHONE_NUMBER: Joi.string().required(), // TODO: make this a phone
  INTERCOM_ACCESS_CODE: Joi.string().default("0000"),
  PUBLIC_BASE_URL: Joi.string().uri().default("https://example.com"),
})
  .unknown()
  .required();

// handle array vars
const arrayVars = ["CORS_ALLOWED_ORIGINS"];

_.each(arrayVars, (key) => {
  if (process.env[key]) {
    process.env[key] = process.env[key].replace(/'/g, '"');
  }
});

const { error, value: envVars } = schema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,
  mailgunApiKey: envVars.MAILGUN_API_KEY,
  mailgunDomain: envVars.MAILGUN_DOMAIN,
  mailgunHost: envVars.MAILGUN_HOST,
  mailgunTestMode: envVars.MAILGUN_TEST_MODE,
  senderEmailAddress: envVars.SENDER_EMAIL_ADDRESS,
  delayResponse: envVars.DELAY_RESPONSE,
  corsAllowedOrigins: envVars.CORS_ALLOWED_ORIGINS,
  jwtSecret: envVars.JWT_SECRET,
  defaultAdministratorEmailAddress: envVars.DEFAULT_ADMIN_EMAIL_ADDRESS,
  twilioAccountSid: envVars.TWILIO_ACCOUNT_SID,
  twilioAuthToken: envVars.TWILIO_AUTH_TOKEN,
  intercomPhoneNumber: envVars.INTERCOM_PHONE_NUMBER,
  intercomAccessCode: envVars.INTERCOM_ACCESS_CODE,
  intercomName: envVars.INTERCOM_NAME,
  publicBaseUrl: envVars.PUBLIC_BASE_URL,
};

module.exports = config;
