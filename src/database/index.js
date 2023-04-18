const mongoose = require('mongoose');
require('dotenv').config();

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log('Connected successfully to Mongo DB'))
  .catch((err) => console.log(err));
