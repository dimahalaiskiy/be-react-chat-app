const { projectId } = require("@/utils/projections");

const lookupUser = (localField, alias) => {
  return {
    from: "users",
    localField,
    foreignField: "_id",
    pipeline: [
      {
        $project: {
          ...projectId,
          username: 1,
          displayName: 1,
          avatar: 1,
        },
      },
    ],
    as: alias,
  };
};

module.exports = {
  lookupUser,
};
