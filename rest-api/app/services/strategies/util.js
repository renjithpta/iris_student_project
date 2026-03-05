const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto-js');
const { jwtSecret } = require('../../../config');
const signToken = (user, secret = jwtSecret) => jwt.sign({ user }, secret, { expiresIn: '30d' });
const verifyToken = (token, secret = jwtSecret) => {
  
  console.log("========inside verify token========");
  let user;
  try {

    user = jwt.verify(token, secret);

  } catch (error) {

   console.log("verifyToken error", error);

    return { err: 'token expired', status: 403 };
  }
  return { user };
};

const hashPassword = async (password) => {
  if (!password) throw new Error('Password was not provided');

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const verifyPassword = async (candidate, actual) => {
  const valid = await bcrypt.compare(candidate, actual);
  return valid;
};

const generateJwtKey = () => crypto.lib.WordArray.random(16).toString();

module.exports = {
  signToken,
  hashPassword,
  verifyPassword,
  generateJwtKey,
  verifyToken,
};
