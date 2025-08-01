const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.CHAT_DB)
  .then(() => console.log("Connected successfully to Mongo DB"))
  .catch((err) => console.log(err));
