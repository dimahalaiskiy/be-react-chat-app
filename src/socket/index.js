const SocketIO = require("socket.io");
const { createAdapter } = require("@socket.io/mongo-adapter");
const { MongoClient } = require("mongodb");
const authMiddleware = require("@/socket/middleware/auth");
const registerChatHandlers = require("@/socket/handlers/chatHandler");
const registerMessageHandlers = require("@/socket/handlers/messageHandler");
const SocketEvents = require("@/socket/events");

const onlineUsers = new Map();

const initializeSocket = async (server) => {
  try {
    const mongoClient = new MongoClient(process.env.CHAT_DB);
    await mongoClient.connect();
    const mongoCollection = mongoClient
      .db("chat_app")
      .collection("socket.io-adapter-events");

    await mongoCollection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 3600 },
    );

    const io = SocketIO(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.adapter(createAdapter(mongoCollection));

    io.use(authMiddleware);

    io.on("connection", (socket) => {
      const userId = socket.request.user.id;
      console.log(`User connected: ${userId}`);

      onlineUsers.set(userId, socket.id);

      socket.broadcast.emit(SocketEvents.USER_ONLINE, {
        user: socket.request.user,
      });

      socket.emit("ONLINE_USERS", Array.from(onlineUsers.keys()));

      registerChatHandlers(io, socket, onlineUsers);
      registerMessageHandlers(io, socket, onlineUsers);

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${userId}`);
        onlineUsers.delete(userId);
        socket.broadcast.emit("USER_OFFLINE", { userId });
      });
    });

    console.log("Socket.IO initialized");
    return io;
  } catch (error) {
    console.error("Socket initialization error:", error);
    throw error;
  }
};

module.exports = {
  initializeSocket,
  getOnlineUsers: () => Array.from(onlineUsers.keys()),
  isUserOnline: (userId) => onlineUsers.has(userId),
  onlineUsers,
};
