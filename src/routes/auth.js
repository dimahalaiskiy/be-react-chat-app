const { Router } = require("express");
const passport = require("passport");
const User = require("@/database/schemas/User");
const { hashPassword } = require("@/utils/helpers");
const { userProjection } = require("@/utils/projections");
const { handleMongoError } = require("@/utils/error");
const { ERROR_MESSAGES } = require("@/constants/errors");
const { ERROR_TYPES, HTTP_STATUS } = require("@/constants/errors");

const router = Router();

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      const apiError = handleMongoError(err);
      return res.status(apiError.statusCode).json({
        message: apiError.message,
        type: apiError.type,
        details: apiError.details,
      });
    }

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: info?.message || ERROR_MESSAGES.INVALID_CREDENTIALS,
        type: ERROR_TYPES.AUTHENTICATION,
      });
    }

    return req.login(user, async (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      const [userData] = await User.aggregate([
        { $match: { _id: user.id } },
        { $project: userProjection },
      ]);

      return res.status(HTTP_STATUS.OK).json({ user: userData });
    });
  })(req, res, next);
});

router.post("/register", async (req, res, next) => {
  const { email, username, displayName, location } = req.body;

  try {
    const password = hashPassword(req.body.password);

    const newUser = await User.create({
      email,
      username,
      displayName,
      password,
      location,
    });

    const [user] = await User.aggregate([
      { $match: { _id: newUser._id } },
      { $project: userProjection },
    ]);

    return req.login(newUser, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(201).json({ user });
    });
  } catch (error) {
    const apiError = handleMongoError(error);
    return res.status(apiError.statusCode).json({
      message: apiError.message,
      type: apiError.type,
      details: apiError.details,
    });
  }
});

router.post("/me", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
  }

  const { user } = req;

  const transformedUser = {
    id: user.id.toString(),
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    location: user.location,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return res.status(200).json({ user: transformedUser });
});

router.post("/logout", async (req, res) => {
  if (req.user) {
    req.session.destroy();
    res.clearCookie("connect.sid");
    return res.sendStatus(200);
  }

  return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
});

module.exports = router;
