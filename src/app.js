const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const MongoStore = require('connect-mongo');
const passport = require('passport');

const { corsOptions } = require('./utils/helpers');

require('./strategies/local');
require('./database/index.js');

// Routes
const marketsRoute = require('./routes/markets');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: 'key',
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl:
        'mongodb+srv://dimagalaiskiy:qwerty123@learnmongo.pxcxty7.mongodb.net/test',
    }),
    cookie: {
      maxAge: 3600000,
      secure: true,
      sameSite: 'none',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/markets', marketsRoute);

app.listen(PORT, () => console.log(`Running server on port ${PORT}`));
