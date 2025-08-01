const Chat = require("@/database/schemas/Chat");
const Message = require("@/database/schemas/Message");
const { toObjectId } = require("@/utils/request");
const SocketEvents = require("@/socket/events");

const registerMessageHandlers = (io, socket, onlineUsers) => {
  socket.on(SocketEvents.MESSAGE_SEND, async (data, reply) => {
    try {
      const { chatId, content } = data;
      const senderId = socket.request.user.id;

      const message = await Message.create({
        chatId: toObjectId(chatId),
        senderId: toObjectId(senderId),
        content,
        isRead: false,
      });

      const chat = await Chat.findByIdAndUpdate(chatId, {
        lastMessage: message,
        $inc: { unread: 1 },
      }).exec();

      const recipientId = chat.participantsIds
        .find((id) => id.toString() !== senderId)
        .toString();

      const messageData = {
        id: message._id.toString(),
        chatId,
        senderId,
        content,
        isRead: false,
        createdAt: message.createdAt,
      };

      reply(messageData);

      const recipientSocketId = onlineUsers.get(recipientId);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit(
          SocketEvents.MESSAGE_RECEIVED,
          messageData,
        );
      }

      socket.emit(SocketEvents.MESSAGE_SENT, messageData);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("ERROR", { message: error.message });
    }
  });

  socket.on("TYPING", ({ chatId, isTyping }) => {
    try {
      const userId = socket.request.user.id;

      Chat.findById(chatId).then((chat) => {
        if (!chat) return;

        const recipientId = chat.participants
          .find((id) => id.toString() !== userId)
          .toString();

        const recipientSocketId = onlineUsers.get(recipientId);

        if (recipientSocketId) {
          io.to(recipientSocketId).emit("USER_TYPING", {
            chatId,
            userId,
            isTyping,
          });
        }
      });
    } catch (error) {
      console.error("Error with typing indicator:", error);
    }
  });

  socket.on("MARK_READ", async ({ chatId }) => {
    try {
      const userId = socket.request.user.id;

      await Message.updateMany(
        {
          chatId: toObjectId(chatId),
          senderId: { $ne: toObjectId(userId) },
          read: false,
        },
        { read: true },
      );

      await Chat.findByIdAndUpdate(chatId, { unread: 0 });

      const chat = await Chat.findById(chatId);
      if (!chat) return;

      const senderId = chat.participants
        .find((id) => id.toString() !== userId)
        .toString();

      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("MESSAGES_READ", { chatId });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
      socket.emit("ERROR", { message: error.message });
    }
  });
};

module.exports = registerMessageHandlers;
