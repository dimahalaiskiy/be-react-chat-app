const mongoose = require("mongoose");

const ChatParticipantsSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "chats",
    required: true,
  },
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "users",
    required: true,
  },
  unread: {
    type: mongoose.SchemaTypes.Number,
    default: 0,
  },
  lastMessageId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "messages",
    required: false,
    default: null,
  },
});

module.exports = mongoose.model("chatParticipants", ChatParticipantsSchema);
