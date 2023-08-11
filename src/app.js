const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const passport = require("passport");

const { corsOptions } = require("./utils/helpers");

require("dotenv").config({
  path: [".env", ".env.local"],
});
require("./strategies/local");
require("./database/index");

// Routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const usersRouter = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.set("trust proxy", 1);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "key",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB,
    }),
    cookie: {
      maxAge: 3600000,
      // secure: process.env.ENV_TYPE === "production",
      // httpOnly: process.env.ENV_TYPE === "development",
      // sameSite: process.env.ENV_TYPE === "development" ? "lax" : "none",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/users", usersRouter);

app.listen(PORT, () => console.log(`Running server on port ${PORT}`));
