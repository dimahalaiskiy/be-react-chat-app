const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('./strategies/local');

// Routes
const marketsRoute = require('./routes/markets');
const authRouter = require('./routes/auth');

require('./database/index.js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: 'https://react-chap-app.vercel.app',
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
  })
);

app.use((req, res, next) => {
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://react-chap-app.vercel.app'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: 'key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        'mongodb+srv://dimagalaiskiy:qwerty123@learnmongo.pxcxty7.mongodb.net/test',
    }),
    cookie: {
      maxAge: 3600000,
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/markets', marketsRoute);

app.listen(PORT, () => console.log(`Running server on port ${PORT}`));
