const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const crypto = require("crypto");

// ─────────────────────────────────────────────────────────────────────────────
// OAUTH 2.0 — Google Strategy Configuration (Authorization Code Grant)
//
// Flow:
//   1. User visits GET /api/v1/users/auth/google
//   2. Passport redirects to Google's OAuth authorization endpoint
//   3. User logs in and consents on Google's page
//   4. Google redirects back to our callback URL with an authorization code
//   5. passport-google-oauth20 exchanges the code for an access token
//   6. Google returns the user's profile (name, email, photo)
//   7. We find or create the user in our MongoDB database
//   8. JWT is issued and set as an httpOnly cookie in the callback route
//
// Required .env variables:
//   GOOGLE_CLIENT_ID     — from Google Cloud Console → Credentials
//   GOOGLE_CLIENT_SECRET — from Google Cloud Console → Credentials
//   FRONTEND_URL         — e.g., http://localhost:3000
// ─────────────────────────────────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/users/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if a user with this Google email already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Existing user — return without creating a new account
          return done(null, user);
        }

        // New user — auto-create account using Google profile data
        // A cryptographically random password is generated since the user
        // will authenticate via Google (not password) going forward.
        // The random password satisfies our password complexity validator.
        const randomPassword = crypto.randomBytes(10).toString("hex") + "A1@";

        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: randomPassword,
          passwordConfirm: randomPassword,
          phoneNumber: "0000000000",    // Placeholder — can be updated in profile
          avatar: {
            public_id: "google_avatar",
            url: profile.photos[0].value, // Use Google profile picture URL
          },
          role: "user",
        });

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// Session serialization/deserialization
// Only the user ID is stored in the session (not the whole user object)
// ─────────────────────────────────────────────────────────────────────────────
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
