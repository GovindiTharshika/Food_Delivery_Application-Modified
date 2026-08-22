const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const crypto = require('crypto');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
    callbackURL: "/api/v1/users/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        return done(null, user);
      }
      
      const randomPassword = crypto.randomBytes(10).toString('hex') + "A1@";
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: randomPassword,
        passwordConfirm: randomPassword,
        phoneNumber: "0000000000",
        avatar: {
          public_id: 'google_avatar',
          url: profile.photos[0].value
        },
        role: "user"
      });
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
