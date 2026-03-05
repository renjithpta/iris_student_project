const passport = require('passport');

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});
const { jwtStrategy } = require('./jwt');
passport.use(jwtStrategy);

module.exports = {
  passport,
  jwt: (req, res, next) => {
    passport.authenticate('jwt', (err, user, info) => {
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
