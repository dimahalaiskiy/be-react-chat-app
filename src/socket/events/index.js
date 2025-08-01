const SocketEvents = {
  // Connection events
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  RECONNECT: "reconnect",
  CONNECT_ERROR: "connect_error",

  // User events
  USER_CONNECTED: "user:connected",
  USER_DISCONNECTED: "user:disconnected",
  USER_STATUS_CHANGE: "user:status_change",
  USER_TYPING: "user:typing",
  USER_STOP_TYPING: "user:stop_typing",
  USER_ONLINE: "user:online",

  // Chat events
  CHAT_CREATE: "chat:create",
  CHAT_CREATED: "chat:created",
  CHAT_UPDATE: "chat:update",
  CHAT_UPDATED: "chat:updated",
  CHAT_DELETE: "chat:delete",
  CHAT_DELETED: "chat:deleted",

  // Message events
  MESSAGE_SEND: "message:send",
  MESSAGE_SENT: "message:sent",
  MESSAGE_RECEIVED: "message:received",
  MESSAGE_READ: "message:read",
  MESSAGE_DELETED: "message:deleted",

  // Notification events
  NOTIFICATION_RECEIVED: "notification:received",
  NOTIFICATION_READ: "notification:read",
};

module.exports = SocketEvents;
