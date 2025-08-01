const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  content: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  senderId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
  },
  chatId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Chat",
    required: true,
  },
  isRead: {
    type: mongoose.SchemaTypes.Boolean,
    default: false,
  },
  createdAt: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now,
  },
  updatedAt: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
