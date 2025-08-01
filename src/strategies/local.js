const passport = require("passport");
const { Strategy } = require("passport-local");
const User = require('@/database/schemas/User');
const { comparePassword } = require('@/utils/helpers');
const { userProjection } = require('@/utils/projections');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found!");
    done(null, user);
  } catch (error) {
    console.log("error", error);
    done(error, null);
  }
});

passport.use(
  new Strategy(
    {
      usernameField: "username",
    },
    async (username, password, done) => {
      try {
        if (!username || !password) {
          throw new Error("Bad request. Missing credentials");
        }

        const user = await User.aggregate([
          { $match: { username } },
          { $project: { ...userProjection, password: 1 } },
        ]);

        if (!user.length)
          return done(null, false, { message: "Invalid credentials" });

        const isValid = comparePassword(password, user[0].password);

        if (isValid) {
          console.log("isValid user", user[0]);
          return done(null, user[0]);
        }

        return done(null, false, { message: "Invalid credentials" });
      } catch (error) {
        return done(error);
      }
    },
  ),
);
