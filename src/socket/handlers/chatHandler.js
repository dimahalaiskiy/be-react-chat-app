const Chat = require("@/database/schemas/Chat");
const { lookupUser } = require("@/lookups");
const { chatProjection } = require("@/utils/projections");
const { toObjectId } = require("@/utils/request");
const SocketEvents = require("@/socket/events");

const getRecipientId = (chat, senderId) => {
  return chat.participantsIds.find(
    (participantId) => participantId.toString() !== senderId,
  );
};

const getPopulatedChat = async (chatId) => {
  const [chat] = await Chat.aggregate([
    { $match: { _id: chatId } },
    { $lookup: lookupUser("participantsIds", "participants") },
    { $project: { ...chatProjection, participants: 1 } },
  ]);

  return chat;
};

const findOrCreateChat = async (userId, recipientId) => {
  const existedChat = await Chat.findOne({
    participantIds: {
      $all: [toObjectId(userId), toObjectId(recipientId)],
    },
  }).lean();

  if (existedChat) {
    return getPopulatedChat(existedChat._id);
  }

  const newChat = await Chat.create({
    participantsIds: [toObjectId(userId), toObjectId(recipientId)],
  });

  return getPopulatedChat(newChat._id);
};

const notifyRecipient = ({ io, event, onlineUsers, recipientId, data }) => {
  const recipientSocketId = onlineUsers.get(recipientId);

  if (recipientSocketId) {
    io.to(recipientSocketId).emit(event, {
      ...data,
    });
  }
};

const registerChatHandlers = (io, socket, onlineUsers) => {
  socket.on(SocketEvents.CHAT_CREATE, async (data, res) => {
    try {
      const { recipientId } = data;
      const userId = socket.request.user.id;

      const chat = await findOrCreateChat(userId, recipientId);

      notifyRecipient({
        io,
        event: SocketEvents.CHAT_CREATED,
        onlineUsers,
        recipientId,
        data: chat,
      });

      socket.emit(SocketEvents.CHAT_CREATED, {
        chat,
        recipientId,
      });
      console.log(" chat", chat);

      res(chat);

      return true;
    } catch (error) {
      console.error("Error creating chat:", error);

      socket.emit("ERROR", { message: error.message });

      return res({ success: false, error: error.message });
    }
  });

  socket.on(SocketEvents.CHAT_DELETE, async (data, res) => {
    try {
      const { chatId } = data;
      const chat = await Chat.findByIdAndDelete(chatId).exec();
      const userId = socket.request.user.id;

      if (chat.participantsIds) {
        const recipientId = getRecipientId(chat, userId);
        notifyRecipient({
          io,
          event: SocketEvents.CHAT_DELETED,
          onlineUsers,
          recipientId: recipientId.toString(),
          data: { chatId },
        });
        socket.emit(SocketEvents.CHAT_DELETED, { chatId });
      }

      return res(chatId);
    } catch (error) {
      console.error("Error deleting chat:", error);

      socket.emit("ERROR", { message: error.message });

      res({ success: false, error: error.message });

      return null;
    }
  });
};

module.exports = registerChatHandlers;
