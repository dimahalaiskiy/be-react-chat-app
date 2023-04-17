const passport = require('passport');
const { Strategy } = require('passport-local');
const User = require('../database/schemas/User');
const { comparePassword } = require('../utils/helpers');

passport.serializeUser((user, done) => {
  console.log('serialize user');
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log('deserialize user');
  try {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found!');
    done(null, user);
  } catch (error) {
    console.log('error', error);
    done(error, null);
  }
});

passport.use(
  new Strategy(
    {
      usernameField: 'email',
    },
    async (email, password, done) => {
      try {
        if (!email || !password)
          throw new Error('Bad request. Missing credentials');
        const userDB = await User.findOne({ email });
        if (!userDB) throw new Error('User not found');
        const isValid = comparePassword(password, userDB.password);
        if (isValid) {
          console.log('Authenticated Successfully!');
          done(null, userDB);
        } else {
          console.log('Invalid Authentication');
          done(null, null);
        }
      } catch (error) {
        console.log('error', error);
        done(error, null);
      }
    }
  )
);
