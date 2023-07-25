const { Router } = require("express");
const passport = require("passport");
const User = require("../database/schemas/User");
const { hashPassword } = require("../utils/helpers");

const router = Router();

router.post("/login", passport.authenticate("local"), async (req, res) => {
  const { email } = req.body;
  const userDB = await User.findOne({ email });
  res.send({ user: userDB });
});

router.post("/register", async (req, res) => {
  const { email, nickname } = req.body;
  const userDB = await User.findOne({ email });
  if (userDB) {
    res.sendStatus(400);
  } else {
    const password = hashPassword(req.body.password);
    await User.create({ email, nickname, password });
    res.sendStatus(201);
  }
});

router.post("/protected", async (req, res) => {
  if (req.user) {
    res.send({ user: req.user });
  } else {
    res.sendStatus(401);
  }
});

router.post("/logout", async (req, res) => {
  if (req.user) {
    req.session.destroy();
    res.clearCookie("connect.sid");
    return res.sendStatus(200);
  }
  return res.sendStatus(404);
});

module.exports = router;
