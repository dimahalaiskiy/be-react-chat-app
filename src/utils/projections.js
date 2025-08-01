const projectId = {
  _id: 0,
  id: "$_id",
};

const userProjection = {
  ...projectId,
  username: 1,
  displayName: 1,
  avatar: 1,
  location: 1,
  createdAt: 1,
  updatedAt: 1,
  email: 1,
};

const chatProjection = {
  ...projectId,
  unread: 1,
  createdAt: 1,
  updatedAt: 1,
  lastMessage: 1,
};

module.exports = {
  projectId,
  userProjection,
  chatProjection,
};
