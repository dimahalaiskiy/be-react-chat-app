const { Router } = require("express");
const { ObjectId } = require("mongodb");
const User = require("@/database/schemas/User");
const { handlePagination, createSearchQuery } = require("@/utils/request");
const { userProjection } = require("@/utils/projections");

const router = Router();

router.use((req, res, next) => {
  if (req.user) next();
  else res.sendStatus(401);
});

router.get("/", async (req, res) => {
  try {
    const { query } = req.query;
    const searchQuery = {
      $and: [
        createSearchQuery("username", query),
        { _id: { $ne: req.user._id } },
      ],
    };

    const users = await handlePagination(
      req,
      (skip, limit) =>
        User.aggregate([
          { $match: searchQuery },
          { $project: userProjection },
          { $skip: skip },
          { $limit: limit },
        ]),
      () => User.countDocuments(searchQuery),
    );

    res.status(200).send(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ error: "Failed to fetch users" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const users = await User.aggregate([
      { $match: { _id: new ObjectId(req.params.id) } },
      userProjection,
    ]);

    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(users[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
