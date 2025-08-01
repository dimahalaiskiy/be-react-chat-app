const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    participantsIds: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "users",
        required: true,
      },
    ],
    lastMessageId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "messages",
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

ChatSchema.index({ participantsIds: 1 });

module.exports = mongoose.model("chats", ChatSchema);
