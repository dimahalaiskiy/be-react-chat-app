const mongoose = require('mongoose');

mongoose
  .connect(
    'mongodb+srv://dimagalaiskiy:qwerty123@learnmongo.pxcxty7.mongodb.net/test'
  )
  .then(() => console.log('Connected successfully to Mongo DB'))
  .catch((err) => console.log(err));
