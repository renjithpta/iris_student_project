const passport = require('passport');
const utils = require('./util');
const db = require('../../../models');
const { roles, contracts,apiKeys } = require('../../../config');
const { Fabric } = require('../../../fabric');

const { ServerError } = require('../../../utils/core');
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});
const { jwtStrategy,headerStrategy } = require('./jwt');
passport.use(jwtStrategy);

module.exports = {
  passport,
  jwt: (req, res, next) => {

    console.log("Inside JWT strategy middleware",req.get('Authorization'));
    const data=   utils.verifyToken(req.get('Authorization').trim());
    console.log("after",data);
    /*utils.(req.get('Authorization')).then(decoded => {
      console.log("Decoded JWT token", decoded);
      req.user = decoded.user;  
      return next();
    }).catch(err => {
      const errorMsg = err.toString().split(':').pop();
      return res.status(401).json({ message: `Issue:Unauthorized,${errorMsg || ' check you\'re token'}` });
    }*/
    passport.authenticate('jwt', (err, user, info) => {
        console.log("Inside JWT strategy middleware2", err, user, info);
      if (err) {
        const errorMsg = err.toString().split(':').pop();
        return res.status(401).json({ message: `Issue:Unauthorized,${errorMsg || ' check you\'re token'}` });
      }
      if (info || !user) {
        const errorMsg = info.toString().split(':').pop();
        return res.status(401).json({ message: `Issue2: Unauthorized,${errorMsg || ' check you\'re token'}` });
      }
      return next();
    })(req, res, next);
  },

 
  apikey: (req, res, next) => {
    passport.authenticate(headerStrategy , (err, user, info) => {
console.log("API KEY",err, "-------",user,"=====",info);
      if (err) {
        const errorMsg = err.toString().split(':').pop();
        return res.status(401).json({ message: `Issue:Unauthorized,${errorMsg || ' check you\'re token'}` });
      }
      if (info || !user) {
        const errorMsg = info.toString().split(':').pop();
        return res.status(401).json({ message: `Issue2: Unauthorized,${errorMsg || ' check you\'re token'}` });
      }
      return next();
    })(req, res, next);
  },

};
