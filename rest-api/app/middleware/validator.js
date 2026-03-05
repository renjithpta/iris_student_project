const Ajv = require('ajv');
// const { ServerError } = require('../../utils/core');

const ajv = new Ajv({ allErrors: true, jsonPointers: true, useDefaults: true });
require('ajv-errors')(ajv, { singleError: true });

const validate = (schema) => (req, res, next) => {
  const { body, params, query } = req;
  const validateSchema = ajv.compile(schema);
  const valid = validateSchema({ body, params, query });
  if (valid) {
    return next();
  }
  // string with all errors and data paths
  const errs = [];
  validateSchema.errors.forEach((err) => {
    if (err.message) errs.push(err.message);
  });
  return res.status(400).json(errs);
};

module.exports = { validate };
