require("module-alias/register");
const { Router } = require("express");
const { toObjectId, handlePagination } = require("@/utils/request");
const Message = require("@/database/schemas/Message");

const router = Router();

router.get("/:chatId", async (req, res) => {
  try {
    const chatId = toObjectId(req.params.chatId);

    const messages = await handlePagination(
      req,
      (skip, limit) =>
        Message.aggregate([
          { $match: { chatId } },
          { $skip: skip },
          { $limit: limit },
        ]),
      () => Message.countDocuments({ chatId }),
    );

    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
