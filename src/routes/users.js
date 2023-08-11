const { Router } = require("express");

const User = require("../database/schemas/User");

const router = Router();

router.use((req, res, next) => {
  if (req.user) next();
  else res.sendStatus(401);
});

router.get("/", async (req, res) => {
  const {
    query: { skip, limit, query },
  } = req;
  const regexName = new RegExp(query, "i");
  const users = await User.find({ nickname: regexName })
    .skip(skip)
    .limit(limit);
  const totalUsersMatchingSearchTerm = await User.countDocuments({
    nickname: regexName,
  });
  const usersLeft = Math.max(0, totalUsersMatchingSearchTerm - limit);
  res.status(200).send({ rows: users, count: usersLeft });
});

module.exports = router;
