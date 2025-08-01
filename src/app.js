require("module-alias/register");
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const passport = require("passport");

const { corsOptions } = require("@/utils/helpers");
const { errorHandler } = require("@/utils/error");
const { initializeSocket } = require("@/socket");

require("dotenv").config({
  path: [".env", ".env.local"],
});

require("@/strategies/local");
require("@/database/index");

const PORT = process.env.PORT || 3001;

// Routes
const authRouter = require("@/routes/auth");
const profileRouter = require("@/routes/profile");
const usersRouter = require("@/routes/users");
const chatsRouter = require("@/routes/chat");
const messagesRouter = require("@/routes/messages");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.set("trust proxy", 1);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/chats", chatsRouter);
app.use("/api/v1/messages", messagesRouter);

app.use(errorHandler);

const initializeSocketIO = async () => {
  try {
    const io = await initializeSocket(server);
    app.set("io", io);
    return io;
  } catch (error) {
    console.error("Failed to initialize Socket.IO:", error);
    return process.exit(1);
  }
};

initializeSocketIO();

server.listen(PORT, () => console.log(`Running server on port ${PORT}`));

module.exports = { app, server };
