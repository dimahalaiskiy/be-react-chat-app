const bcrypt = require('bcryptjs');

function hashPassword(password) {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
}

function comparePassword(raw, hash) {
  return bcrypt.compareSync(raw, hash);
}

const whitelist = [
  'https://react-chap-app.vercel.app',
  'http://localhost:2375',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
};

module.exports = {
  hashPassword,
  comparePassword,
  corsOptions,
};
