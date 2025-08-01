const {
  MONGO_ERROR_CODES,
  HTTP_STATUS,
  ERROR_TYPES,
  ERROR_MESSAGES,
} = require('@/constants/errors');

class ApiError extends Error {
  constructor(type, message, statusCode, details = null) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

const handleMongoError = (error) => {
  if (error.code === MONGO_ERROR_CODES.DUPLICATE_KEY) {
    const field = Object.keys(error.keyPattern)[0];
    const fieldCapitalized = field.charAt(0).toUpperCase() + field.slice(1);
    const message = `${fieldCapitalized} already exists`;

    return new ApiError(ERROR_TYPES.DUPLICATE, message, HTTP_STATUS.CONFLICT, {
      field,
    });
  }

  if (
    error.code === MONGO_ERROR_CODES.VALIDATION_FAILED ||
    error.name === "ValidationError"
  ) {
    return new ApiError(
      ERROR_TYPES.VALIDATION,
      "Validation failed",
      HTTP_STATUS.BAD_REQUEST,
      error.errors,
    );
  }

  return new ApiError(
    ERROR_TYPES.SERVER,
    ERROR_MESSAGES.SERVER_ERROR,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
  );
};

const errorHandler = (err, req, res) => {
  console.error("Error:", err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      type: err.type,
      message: err.message,
      details: err.details,
      timestamp: err.timestamp,
    });
  }

  if (err.name === "MongoError" || err.name === "MongoServerError") {
    const apiError = handleMongoError(err);
    return res.status(apiError.statusCode).json({
      type: apiError.type,
      message: apiError.message,
      details: apiError.details,
      timestamp: apiError.timestamp,
    });
  }

  const serverError = new ApiError(
    ERROR_TYPES.SERVER,
    ERROR_MESSAGES.SERVER_ERROR,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
  );

  return res.status(serverError.statusCode).json({
    type: serverError.type,
    message: serverError.message,
    timestamp: serverError.timestamp,
  });
};

const createNotFoundError = (message = ERROR_MESSAGES.NOT_FOUND) => {
  return new ApiError(ERROR_TYPES.NOT_FOUND, message, HTTP_STATUS.NOT_FOUND);
};

const createUnauthorizedError = (message = ERROR_MESSAGES.UNAUTHORIZED) => {
  return new ApiError(
    ERROR_TYPES.AUTHENTICATION,
    message,
    HTTP_STATUS.UNAUTHORIZED,
  );
};

const createValidationError = (message, details) => {
  return new ApiError(
    ERROR_TYPES.VALIDATION,
    message,
    HTTP_STATUS.BAD_REQUEST,
    details,
  );
};

module.exports = {
  ApiError,
  errorHandler,
  handleMongoError,
  createNotFoundError,
  createUnauthorizedError,
  createValidationError,
};
