const { Joi } = require("express-validation");

const defaultValidationOptions = {
  allowUnknownBody: false,
  allowUnknownHeaders: true,
  allowUnknownQuery: false,
  allowUnknownParams: false,
  allowUnknownCookies: true,
};

const dateFilterSchema = [
  Joi.date().iso(),
  Joi.object({
    gt: Joi.date().iso(),
    gte: Joi.date().iso(),
    lt: Joi.date().iso(),
    lte: Joi.date().iso(),
    ">": Joi.date().iso(),
    ">=": Joi.date().iso(),
    "<": Joi.date().iso(),
    "<=": Joi.date().iso(),
  }),
];

const listQuerySchema = {
  limit: Joi.number().integer().min(1).max(100),
  offset: Joi.number().integer().min(1).max(999999),
  expand: Joi.string(),
  sort: Joi.string(),
  fields: Joi.string(),
  exclude: Joi.string(),
};

const getQuerySchema = {
  expand: Joi.string(),
  fields: Joi.string(),
  exclude: Joi.string(),
};

const createToken = {
  body: Joi.object({
    emailAddress: Joi.string().email().lowercase().trim().required(),
  }),
};

module.exports = {
  defaultValidationOptions,
  listQuerySchema,
  getQuerySchema,
  dateFilterSchema,
  createToken,
};
