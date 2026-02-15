const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

function configurePassport(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
      try {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const user = await User.findByEmail(normalizedEmail);

        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password || '', user.passwordHash);
        if (!validPassword) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });
}

module.exports = configurePassport;
