const { Strategy } = require('passport-jwt');
const { jwtSecret } = require('../../../config');
const utils = require('./util');
const db = require('../../../models');
const { Fabric } = require('../../../fabric');
const HeaderAPIKeyStrategy = require('passport-headerapikey').HeaderAPIKeyStrategy
const { ServerError } = require('../../../utils/core');

const JWTStrategy = Strategy;

const strategyOptions = {
  jwtFromRequest: (req) => req.get('Authorization'),
  secretOrKey: jwtSecret,
  passReqToCallback: true,
};

exports.headerStrategy = new HeaderAPIKeyStrategy(
   { header: 'Authorization', prefix: '' },  
   true,
  async function(apikey, done,req) {
console.log("=========inside header strategy========",apikey);
  const user = await db.User.scope('withPassword').findOne({ where: { apikey }, raw: true });
  if (!user) return done(new ServerError('no such user', 404));
  console.log("=========inside header strategy========",user.username, user.fabricOrg);
  req.user = user;
    console.log("=========inside header strategy========3");
  const { error } = await Fabric.connect(user.username, user.fabricOrg);
  if (error){
    const { error: err1 } = await Fabric.enrollUser(user.username.trim(),  "123456",user.fabricOrg.trim());
    if (err1)  return done(new ServerError('fabric gateway connection error', 417));
    const { error: err2 } = await Fabric.connect(user.username.trim(), user.fabricOrg.trim());
    if (err2)   return done(new ServerError('fabric gateway connection error', 417));    
    
  }
  return done(null, user);

  }
);
const verifyCallback = async (req, jwtPayload, done) => {
  console.log("=========inside verify callback========");
  const { id } = jwtPayload.user;
  console.log("Inside verifyCallback id", id)
  const user = await db.User.findOne({ where: { id }, raw: true });
  if (!user) return done(new ServerError('no such user', 404));
  req.user = user;
   console.log("=========inside verify callback========"),(user.username, user.fabricOrg);
  const { error } = await Fabric.connect(user.username, user.fabricOrg);
    console.log("=========inside verify callback========"),(user.username, user.fabricOrg, error);
  if (error) return done(new ServerError('fabric gateway connection error', 417));
  return done(null, user);
};

exports.jwtStrategy = new JWTStrategy(strategyOptions, verifyCallback);