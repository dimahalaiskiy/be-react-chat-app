const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { ERROR_MESSAGES } = require("@/constants/errors");

const authMiddleware = (socket, next) => {
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "key",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.CHAT_DB,
    }),
    cookie: {
      maxAge: 86400000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  });

  sessionMiddleware(socket.request, {}, () => {
    passport.initialize()(socket.request, {}, () => {
      passport.session()(socket.request, {}, () => {
        if (socket.request.user) {
          return next();
        }
        return next(new Error(ERROR_MESSAGES.UNAUTHORIZED));
      });
    });
  });
};

module.exports = authMiddleware;
