const { Strategy } = require('passport-jwt');
const { jwtSecret } = require('../../../config');
const db = require('../../../models');
const { Fabric } = require('../../../fabric');

const { ServerError } = require('../../../utils/core');

const JWTStrategy = Strategy;

const strategyOptions = {
  jwtFromRequest: (req) => req.get('Authorization'),
  secretOrKey: jwtSecret,
  passReqToCallback: true,
};

const verifyCallback = async (req, jwtPayload, done) => {
  const { id } = jwtPayload.user;
  console.log("Inside verifyCallback id", id)
  const user = await db.User.findOne({ where: { id }, raw: true });
  if (!user) return done(new ServerError('no such user', 404));
  req.user = user;
  const { error } = await Fabric.connect(user.username, user.fabricOrg);
  if (error) return done(new ServerError('fabric gateway connection error', 417));
  return done(null, user);
};

exports.jwtStrategy = new JWTStrategy(strategyOptions, verifyCallback);
