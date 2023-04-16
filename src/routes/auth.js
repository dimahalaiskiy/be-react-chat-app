const { Router, response } = require('express');
const passport = require('passport');
const User = require('../database/schemas/User');
const { hashPassword } = require('../utils/helpers');

const router = Router();

router.post('/login', passport.authenticate('local'), (req, res) =>
  res.sendStatus(200)
);

router.post('/register', async (req, res) => {
  const { email, nickname } = req.body;
  const userDB = await User.findOne({ email });
  if (userDB) {
    res.status(400).send('User already exists!');
  } else {
    const password = hashPassword(req.body.password);
    console.log(password);
    await User.create({ email, nickname, password });
    res.send(201);
  }
});

router.post('/protected', async (req, res) => {
  console.log('req', req);
  if (req.user) {
    res.send({ user: req.user });
  } else {
    res.status(401).send({ error: 'Unauthorized' });
  }
});

module.exports = router;
