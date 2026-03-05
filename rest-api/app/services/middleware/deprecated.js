const { ServerError } = require('../../utils/core');

exports.deprecated = (req, res, next) => {
  next(new ServerError('API_DEPRECATED', 410));
};
