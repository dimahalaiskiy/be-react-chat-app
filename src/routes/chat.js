const { Router } = require("express");
const { ObjectId } = require("mongodb");
const Chat = require("@/database/schemas/Chat");
const { chatProjection } = require("@/utils/projections");
const { lookupUser } = require("@/lookups");
const { handleMongoError } = require("@/utils/error");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const userId = new ObjectId(req.user.id);

    const chats = await Chat.aggregate([
      { $match: { participantsIds: userId } },
      { $sort: { updatedAt: -1 } },
      { $lookup: lookupUser("participantsIds", "participants") },
      {
        $project: {
          ...chatProjection,
          participants: 1,
        },
      },
    ]);

    return res.json(chats);
  } catch (error) {
    const apiError = handleMongoError(error);
    return res.status(apiError.statusCode).json({
      message: apiError.message,
      type: apiError.type,
      details: apiError.details,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const chatId = new ObjectId(req.params.id);

    const [chat] = await Chat.aggregate([
      { $match: { _id: chatId } },
      { $sort: { updatedAt: -1 } },
      { $lookup: lookupUser("participantsIds", "participants") },
      {
        $project: {
          ...chatProjection,
          participants: 1,
        },
      },
    ]);

    if (!chat.length) {
      return res.status(404).json({ message: "Chat not found" });
    }

    return res.json(chat);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
