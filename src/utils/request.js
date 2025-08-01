const mongoose = require("mongoose");

const handlePagination = async (
  req,
  findCallback,
  countCallback,
  projection = null,
) => {
  const { skip = 0, limit = 10 } = req.query;

  const parsedSkip = parseInt(skip, 10);
  const parsedLimit = parseInt(limit, 10);

  const [rows, count] = await Promise.all([
    findCallback(parsedSkip, parsedLimit, projection),
    countCallback(),
  ]);

  const nextSkip =
    parsedSkip + parsedLimit < count ? parsedSkip + parsedLimit : null;

  return {
    rows,
    pagination: {
      total: count,
      limit: parsedLimit,
      skip: nextSkip,
    },
  };
};

const createSearchQuery = (field, query) => {
  if (!query) return {};

  return {
    [field]: { $regex: query, $options: "i" },
  };
};

// Convert string ID to MongoDB ObjectId
const toObjectId = (id) => {
  if (id instanceof mongoose.Types.ObjectId) return id;

  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }

  throw new Error(`Cannot represent "${id}" to the BSON ObjectId type`);
};

module.exports = {
  handlePagination,
  createSearchQuery,
  toObjectId,
};
