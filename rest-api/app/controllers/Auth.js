const {
  login,
  register,
} = require('../services/auth');

const { controller } = require('../middleware/controller');
module.exports = {
  login: controller(login),
  register: controller(register),
};
