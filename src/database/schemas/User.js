const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: mongoose.SchemaTypes.String,
      required: true,
      unique: true,
    },
    username: {
      type: mongoose.SchemaTypes.String,
      required: true,
      unique: true,
    },
    displayName: {
      type: mongoose.SchemaTypes.String,
      required: true,
      unique: false,
    },
    location: {
      type: mongoose.SchemaTypes.String,
      default: null,
      required: false,
      unique: false,
    },
    password: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    createdAt: {
      type: mongoose.SchemaTypes.Date,
      required: true,
      default: new Date(),
    },
    avatar: {
      type: mongoose.SchemaTypes.String,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.index({ username: 1 });

module.exports = mongoose.model("users", UserSchema);
